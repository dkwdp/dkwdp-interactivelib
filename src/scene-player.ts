import {Audio, AudioFile, AudioPlayer} from "./audio";
import p5 from "p5";
import {Scene} from "./scene";
import {worldToScreen} from "./figure";

const MAX_TIME_EPSILON = 0.001;

export class AudioBuffer {
    private audios: Map<string, AudioFile>;

    constructor() {
        this.audios = new Map();
    }

    /**
     * Loads the given audios.
     * @param audios An array of audios, given as tuple [name, filename]. The name is a unique identifier for the audio.
     * @param audioCtx The AudioContext to use for playback.
     * The filename is the path to the audio file.
     */
    async load(audios: string[], audioCtx: AudioContext) {
        for (const filename of audios) {
            const audio = new AudioFile(filename, audioCtx);
            await audio.load();
            this.audios.set(filename, audio);
        }
    }

    /**
     * Returns the audio segment with the given name.
     * @param audio The name of the audio.
     * @returns The audio
     */
    get(audio: string): AudioFile {
        const result = this.audios.get(audio);
        if (!result)
            throw new Error(`Audio segment not found: ${audio}`);
        return result;
    }
}

export class SpriteBuffer {
    private sprites: Map<string, p5.Image>

    constructor() {
        this.sprites = new Map();
    }

    /**
     * Loads a set of sprite images and stores them in the sprites map.
     *
     * @param sprites - An array of file paths to the sprite images.
     * @param p - An instance of the p5 library used to load the images.
     * @return A promise that resolves once all images are loaded and stored.
     */
    async load(sprites: string[], p: p5) {
        for (const filename of sprites) {
            const sprite = await p.loadImage(filename);
            this.sprites.set(filename, sprite);
        }
    }

    get(sprite: string): p5.Image {
        const result = this.sprites.get(sprite) || null;
        if (!result)
            throw new Error(`Sprite not found: ${sprite}`);
        return result;
    }
}

export class RenderContext {
    p: p5;
    spriteBuffer: SpriteBuffer;

    constructor(p: p5, spriteBuffer: SpriteBuffer) {
        this.p = p;
        this.spriteBuffer = spriteBuffer;
    }

    /**
     * Renders a sprite at the given position.
     * @param sprite The sprite to render.
     * @param x The x-coordinate of the sprite's center.
     * @param y The y-coordinate of the sprite's center.
     * @param size The size of the sprite.
     * @param rotation The rotation of the sprite in radians.
     *
     * TODO: use coordinate system, use rotation
     */
    renderSprite(sprite: string, x: number, y: number, size: number = 1.0, rotation: number = 0) {
        let image = this.spriteBuffer.get(sprite);
        let world_xy = worldToScreen(x, y, this.p);
        this.p.image(image, world_xy[0], world_xy[1], image.width * size, image.height * size);
    }
}

export class AudioEngine {
    private readonly audioPlayers: Map<string, AudioPlayer>;
    private readonly audioBuffer: AudioBuffer;

    constructor(audioPlayers: Map<string, AudioPlayer>, audioBuffer: AudioBuffer) {
        this.audioPlayers = audioPlayers;
        this.audioBuffer = audioBuffer;
    }

    playAudio(filename: string) {
        const source = this.audioBuffer.get(filename);
        if (!source) throw new Error(`Audio file not found: ${filename}`);
        const player = source.createPlayer();
        player.play();
        this.audioPlayers.set(filename, player);
    }
}

export class ScenePlayer {
    private readonly sceneBuffer: Map<string, Scene>;
    private readonly audioBuffer: AudioBuffer;
    private readonly spriteBuffer: SpriteBuffer;
    private readonly audioCtx: AudioContext;
    private loaded: boolean = false;
    private initialized: boolean = false;
    private currentScene: Scene | null = null;
    private playing: boolean = false;

    /* The timepoint when the currentAnimationScene was started in the time system of the audioCtx */
    private currentSceneStartTime: number = 0;

    private currentAudioPlayers: Map<string, AudioPlayer>;

    constructor(sceneBuffer: Map<string, Scene>) {
        this.sceneBuffer = sceneBuffer;
        this.audioBuffer = new AudioBuffer();
        this.spriteBuffer = new SpriteBuffer();
        this.audioCtx = new window.AudioContext();
        this.currentAudioPlayers = new Map();
    }

    /**
     * Loads audio and sprite resources into buffers and marks the instance as loaded.
     *
     * @param p - The p5.js instance used for processing sprite assets.
     * @param audios - An array of audio file paths to be loaded into the audio buffer.
     * @param sprites - An array of sprite file paths to be loaded into the sprite buffer.
     * @return A promise that resolves when all resources are successfully loaded.
     */
    async load(p: p5, audios: string[], sprites: string[]) {
        await this.audioBuffer.load(audios, this.audioCtx);
        await this.spriteBuffer.load(sprites, p);
        this.loaded = true;
    }

    setScene(scene: Scene) {
        this.currentScene = scene;
        this.currentSceneStartTime = this.audioCtx.currentTime;
    }

    play() {
        this.audioCtx.resume().then(() => {this.initialized = true;})
        this.playing = true;
    }

    /**
     * Returns the time that the current scene has been playing for in seconds.
     */
    currentTime(globalTime: number): number {
        if (!this.loaded) return -1;
        return globalTime - this.currentSceneStartTime;
    }

    update(p: p5) {
        if (!this.loaded || !this.initialized || !this.currentScene) return;

        const globalTime = this.audioCtx.currentTime;
        const currentSceneTime = this.currentTime(globalTime);
        const update = this.currentScene!.update(
            currentSceneTime,
            new RenderContext(p, this.spriteBuffer),
            new AudioEngine(this.currentAudioPlayers, this.audioBuffer)
        );

        this.handleAudio(update.audios, globalTime);

        this.handleNextScene(update.nextScene);
    }

    handleNextScene(nextScene: string | null) {
        if (nextScene === null) return;

        const scene = this.sceneBuffer.get(nextScene);
        if (!scene) throw new Error(`Unable to find scene "${nextScene}"`);

        this.setScene(scene);
    }

    handleAudio(audios: Audio[], globalTime: number) {
        const usedPlayers = new Map<string, AudioPlayer>();
        for (const audio of audios) {
            const player = this.currentAudioPlayers.get(audio.filename);
            let newPlayerNeeded = true;
            if (player) {
                // remove player, if too far off
                if (Math.abs(player.getPosition(globalTime) - audio.time) > MAX_TIME_EPSILON) {
                    player.stop();
                    this.currentAudioPlayers.delete(audio.filename);
                } else {
                    newPlayerNeeded = false;
                    usedPlayers.set(audio.filename, player);
                }
            }
            if (newPlayerNeeded) {
                const source = this.audioBuffer.get(audio.filename)
                if (audio.isValid(source.duration())) {
                    const player = source.createPlayer();
                    player.play(audio.time, globalTime);
                    this.currentAudioPlayers.set(audio.filename, player);
                    usedPlayers.set(audio.filename, player);
                }
            }
        }

        this.currentAudioPlayers = usedPlayers;
    }
}