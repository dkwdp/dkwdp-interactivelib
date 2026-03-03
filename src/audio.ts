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
}

export class AudioSegment {
    private audioCtx: AudioContext;
    private readonly filename: string;
    private buffer: AudioBuffer | null = null;
    private source: AudioBufferSourceNode | null = null;
    private playing: boolean = false;
    private startOffset: number = 0;
    private globalStartTime: number = 0;
    public onended: () => void = () => {};

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

    createSource() {
        this.source = this.audioCtx.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.audioCtx.destination);
        this.source.onended = () => {
            // check if we reached the end of the audio segment
            if (this.reachedEnd()) {
                this.stop();
                this.onended();
            }
        };
    }

    reachedEnd(): boolean {
        return Math.abs(this.currentTime() - this.duration()) < 0.01;
    }

    /**
     * Calculates and returns the duration in seconds.
     *
     * @return {number} The duration value in seconds.
     */
    duration(): number {
        return this.buffer!.duration;
    }

    /**
     * Starts to play the audio segment.
     */
    play() {
        if (!this.isLoaded() || this.playing) return;
        this.createSource();
        this.source!.start(0, this.startOffset);
        this.playing = true;
        this.globalStartTime = this.audioCtx.currentTime;
    }

    /**
     * Pauses the audio segment. Another call to play() will resume playback at the same position.
     */
    pause() {
        if (!this.isLoaded() || !this.playing) return;
        this.startOffset = this.currentTime();
        if (this.source) {
            this.source!.stop();
            this.source = null;
        }
        this.playing = false;
    }

    /**
     * Stops the audio segment. Another call to play() will restart playback from the beginning.
     */
    stop() {
        if (!this.isLoaded()) return;
        if (this.source)
            this.source!.stop();
        this.startOffset = 0;
        this.playing = false;
    }

    /**
     * Seeks to a specific time within the audio segment. Audio is always paused afterwards.
     * @param position Position in seconds.
     */
    seek(position: number) {
        this.stop();
        this.startOffset = position;
    }

    /**
     * Returns the current playback time in seconds.
     */
    currentTime(): number {
        if (!this.isLoaded()) return -1;
        if (this.playing) {
            return this.audioCtx.currentTime - this.globalStartTime + this.startOffset;
        } else {
            return this.startOffset;
        }
    }

    /**
     * Returns true if the audio segment is currently playing.
     */
    isPlaying(): boolean {
        return this.playing;
    }

    /**
     * Executes a function when the audio segment finishes playing.
     *
     * @param f Function to execute.
     */
    then(f: () => void): AudioSegment {
        this.onended = f;
        return this;
    }
}
