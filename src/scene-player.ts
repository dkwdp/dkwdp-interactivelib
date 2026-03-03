import {Audio, AudioFile, AudioPlayer} from "./audio";
import p5 from "p5";
import {AnimationScene, RenderContext} from "./animation-scene";

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

export class ScenePlayer {
    private readonly audioBuffer: AudioBuffer;
    private readonly spriteBuffer: SpriteBuffer;
    private readonly audioCtx: AudioContext;
    private loaded: boolean = false;
    private initialized: boolean = false;
    private currentScene: AnimationScene | null = null;
    private playing: boolean = false;

    /* The when the currentScene was started in the time system of the audioCtx */
    private currentSceneStartTime: number = 0;

    private currentAudioPlayers: Map<string, AudioPlayer>;

    constructor() {
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

    setScene(scene: AnimationScene) {
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
        if (!this.loaded || !this.currentScene || !this.initialized) return;

        const globalTime = this.audioCtx.currentTime;
        const currentSceneTime = this.currentTime(globalTime);
        const audios = this.currentScene.update(currentSceneTime, new RenderContext(p, this.spriteBuffer));

        this.handleAudio(audios, globalTime);
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
                const player = this.audioBuffer.get(audio.filename).createPlayer();
                player.play(audio.time, globalTime);
                this.currentAudioPlayers.set(audio.filename, player);
                usedPlayers.set(audio.filename, player);
            }
        }

        this.currentAudioPlayers = usedPlayers;
    }
}