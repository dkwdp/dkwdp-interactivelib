import p5 from "p5";

export class Audio {
    /**
     * The filename of the audio resource.
     */
    filename: string;
    /**
     * The current playback position in seconds.
     */
    time: number;

    constructor(filename: string, time: number = 0) {
        this.filename = filename;
        this.time = time;
    }

    isValid(duration: number): boolean {
        return this.time >= 0 && this.time <= duration;
    }
}

export class AudioPlayer {
    private source: AudioBufferSourceNode;
    private audioCtx: AudioContext;
    readonly duration: number;
    private _playing: boolean = false;
    private startOffset: number = 0;
    private globalStartTime: number = 0;

    constructor(source: AudioBufferSourceNode, audioCtx: AudioContext, duration: number) {
        this.source = source;
        this.audioCtx = audioCtx;
        this.duration = duration;

        // We always assume that the audio context is running
        if (this.audioCtx.state !== "running")
            throw new Error("Audio context is not running");

        // stop playing onended
        this.source.onended = () => {
            this._playing = false;
        };
    }

    public get playing(): boolean {
        return this._playing;
    }

    play(offset: number = 0, globalTime: number = -1) {
        if (globalTime == -1)
            globalTime = this.audioCtx.currentTime;

        this.globalStartTime = globalTime;
        this.startOffset = offset;

        if (this._playing)
            this.stop();

        this.source.start(0, offset);
        this._playing = true;
    }

    /**
     * Stops the audio segment. Another call to play() will restart playback from the beginning.
     */
    stop() {
        if (this._playing)
            this.source.stop();
        this.startOffset = 0;
        this._playing = false;
    }

    getPosition(globalTime: number = -1): number {
        if (globalTime == -1)
            globalTime = this.audioCtx.currentTime;

        return globalTime - this.globalStartTime + this.startOffset;
    }
}

export class AudioFile {
    private readonly filename: string;
    private readonly audioCtx: AudioContext;
    private buffer: AudioBuffer | null = null;

    constructor(filename: string, audioCtx: AudioContext) {
        this.filename = filename;
        this.audioCtx = audioCtx;
    }

    isLoaded(): boolean {
        return this.buffer !== null;
    }

    /**
     * Ensures that the audio segment is loaded.
     */
    async load() {
        if (this.isLoaded()) return;
        const response = await fetch(this.filename);
        const arrayBuffer = await response.arrayBuffer();
        this.buffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    }

    createPlayer(): AudioPlayer {
        if (!this.isLoaded()) throw new Error("Audio file not loaded");
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.audioCtx.destination);
        return new AudioPlayer(source, this.audioCtx, this.duration());
    }

    /**
     * Calculates and returns the duration in seconds.
     *
     * @return {number} The duration value in seconds.
     */
    duration(): number {
        return this.buffer!.duration;
    }
}

export class AudioBuf {
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
