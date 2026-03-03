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
    private playing: boolean = false;
    private startOffset: number = 0;
    private globalStartTime: number = 0;

    constructor(source: AudioBufferSourceNode, audioCtx: AudioContext, duration: number) {
        this.source = source;
        this.audioCtx = audioCtx;
        this.duration = duration;

        // We always assume that the audio context is running
        if (this.audioCtx.state !== "running")
            throw new Error("Audio context is not running");
    }

    play(offset: number = 0, globalTime: number = -1) {
        if (globalTime == -1)
            globalTime = this.audioCtx.currentTime;

        this.globalStartTime = globalTime;
        this.startOffset = offset;

        if (this.playing)
            this.stop();

        this.source.start(0, offset);
        this.playing = true;
    }

    /**
     * Stops the audio segment. Another call to play() will restart playback from the beginning.
     */
    stop() {
        if (this.playing)
            this.source.stop();
        this.startOffset = 0;
        this.playing = false;
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
