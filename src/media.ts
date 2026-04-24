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

type Media = p5.Image | AudioFile;

type LoadKind = 'failed' | 'success' | 'loading';

interface LoadState {
    kind: LoadKind;
}

interface SuccessState<T extends Media> extends LoadState {
    kind: 'success';
    media: T;
}

interface LoadingState extends LoadState {
    kind: 'loading';
    requestTime: number; // start time in milliseconds by performance.now()
}

interface FailedState extends LoadState {
    kind: 'failed';
    reason: string;
}

type AudioLoadState = SuccessState<AudioFile> | LoadingState | FailedState;

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

type ImageLoadState = SuccessState<p5.Image> | LoadingState | FailedState;
type ImageLoadedState = SuccessState<p5.Image> | FailedState;

/**
 * Generates a 1:1 "broken file" icon image.
 * @param p The p5 instance.
 * @param size The width and height of the resulting image.
 */
export function generateBrokenFileIcon(p: p5, size: number): p5.Image {
    const pg = p.createGraphics(size, size);
    const pad = size * 0.15;
    const sw = size * 0.05;

    pg.clear(0, 0, 0, 0);
    pg.stroke(150);
    pg.strokeWeight(sw);
    pg.fill(240);

    // Draw paper shape with dog-ear corner
    pg.beginShape();
    pg.vertex(pad, pad);
    pg.vertex(size - pad - size * 0.2, pad);
    pg.vertex(size - pad, pad + size * 0.2);
    pg.vertex(size - pad, size - pad);
    pg.vertex(pad, size - pad);
    pg.vertex(pad, pad);
    pg.endShape();

    // Draw the red cross
    pg.stroke(200, 40, 40);
    pg.noFill();
    pg.beginShape();
    pg.vertex(size * 0.4, size * 0.4);
    pg.vertex(size * 0.6, size * 0.6);
    pg.endShape();
    pg.beginShape();
    pg.vertex(size * 0.4, size * 0.6);
    pg.vertex(size * 0.6, size * 0.4);
    pg.endShape();

    // Convert to p5.Image
    const img = pg.get();
    pg.remove(); // Clean up graphics buffer
    return img;
}


export class SpriteBuffer {
    private readonly p: p5;
    private readonly sprites: Map<string, ImageLoadState>
    private readonly loadTimeout: number;
    public readonly brokenFileImage: p5.Image;
    public readonly unloadedImage: p5.Image;

    constructor(p: p5, defaultImageSize: number = 100, loadTimeout: number = 5000) {
        this.p = p;
        this.sprites = new Map();
        this.brokenFileImage = generateBrokenFileIcon(p, defaultImageSize);
        this.unloadedImage = p.createImage(defaultImageSize, defaultImageSize);
        this.loadTimeout = loadTimeout;
    }

    /**
     * Loads a set of sprite images and stores them in the sprites map.
     *
     * @param sprites - An array of file paths to the sprite images.
     * @return A promise that resolves once all images are loaded and stored.
     */
    async load(sprites: string[]) {
        await Promise.all(sprites.map(filename => this.loadImage(filename)));
    }

    /**
     * Loads and returns a ImageLoadedState with the requested image.
     * Should not be called, if the image is already saved.
     * @param filename The filename to load
     */
    async loadImage(filename: string): Promise<ImageLoadState> {
        // if image is already saved
        const cached = this.sprites.get(filename);
        if (cached) return cached;

        this.sprites.set(filename, {kind: 'loading', requestTime: performance.now()});
        try {
            const sprite = await this.p.loadImage(filename);
            const result: ImageLoadedState = {kind: 'success', media: sprite};
            this.sprites.set(filename, result);
            return result;
        } catch (error) {
            let reason = 'unknown reason';
            if (error instanceof DOMException) {
                reason = `Image "${filename}" could not be found.`;
            }
            const result: ImageLoadedState = {kind: 'failed', reason};
            this.sprites.set(filename, result);
            return result;
        }
    }

    /**
     * This will return the loaded image, if it is already loaded. A broken image icon, if
     * the image failed to load, or a fully transparent image if the image is still loading.
     * @param sprite The requested sprite
     */
    get(sprite: string): p5.Image {
        const result = this.getDetailed(sprite);
        switch (result.kind) {
            case "success":
                return result.media;
            case "failed":
                return this.brokenFileImage;
            case "loading":
                return this.unloadedImage;
        }
    }

    /**
     * Retrieves the detailed loading state of a given sprite.
     *
     * @param {string} sprite The name of the sprite to get the detailed state for.
     * @return {ImageLoadState} The loading state of the specified sprite. If the sprite is not found,
     *                          it initiates the image loading process and returns a state with kind `loading`.
     */
    getDetailed(sprite: string): ImageLoadState {
        // initiate loading, if first request for this sprite
        let result = this.sprites.get(sprite) || null;
        if (result === null) {
            this.loadImage(sprite).then(() => {});
            // requestTime is a bit unprecise as loadImage will overwrite it, but it doesn't really matter.
            return {kind: 'loading', requestTime: performance.now()};
        }

        // mark as failed, if loaded too long
        if (result.kind === 'loading' && performance.now() - result.requestTime > this.loadTimeout) {
            result = {kind: 'failed', reason: 'timeout'};
            this.sprites.set(sprite, result);
        }

        return result;
    }
}
