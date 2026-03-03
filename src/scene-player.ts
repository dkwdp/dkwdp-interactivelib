import {AudioSegment} from "./audio";
import p5 from "p5";
import {AnimationScene, RenderContext} from "./animation-scene";

export class AudioBuffer {
    private audios: Map<string, AudioSegment>;

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
            const audio = new AudioSegment(filename, audioCtx);
            await audio.load();
            this.audios.set(filename, audio);
        }
    }

    /**
     * Returns the audio segment with the given name.
     * @param audio The name of the audio.
     * @returns The audio
     */
    get(audio: string): AudioSegment {
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
    private currentScene: AnimationScene | null = null;
    private playing: boolean = false;

    /* The when the currentScene was started in the time system of the audioCtx */
    private currentSceneStartTime: number = 0;

    constructor() {
        this.audioBuffer = new AudioBuffer();
        this.spriteBuffer = new SpriteBuffer();
        this.audioCtx = new window.AudioContext();
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

    isLoaded(): boolean {
        return this.loaded;
    }

    setScene(scene: AnimationScene) {
        this.currentScene = scene;
        this.currentSceneStartTime = this.audioCtx.currentTime;
    }

    play() {
        this.audioCtx.resume().catch(() => { console.error("AudioContext could not be resumed."); });
        this.playing = true;
    }

    /**
     * Returns the time that the current scene has been playing for in seconds.
     */
    currentTime(): number {
        if (!this.loaded) return -1;
        return this.audioCtx.currentTime - this.currentSceneStartTime;
    }

    update(p: p5) {
        if (!this.loaded || !this.currentScene) return;

        const renderContext = new RenderContext(p, this.spriteBuffer);
        const currentSceneTime = this.currentTime();
        const audios = this.currentScene.update(currentSceneTime, renderContext);

        // TODO handle audio
    }
}