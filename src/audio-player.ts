import p5 from 'p5';

export class AudioPlayer {
    private p: p5;
    private segments: AudioSegment[];
    /* index of next segment to play or current segment being played */
    private currentSegmentIndex: number = 0;
    private playing: boolean = false;
    public onended: () => void = () => {};
    private lastWidth: number;
    private segmentPositions: number[][] = [];
    private loaded: boolean = false;

    constructor(p: p5, segments: AudioSegment[]) {
        this.p = p;
        this.segments = segments;
        this.lastWidth = p.width;

        // Start loading all segments
        this.loadAllSegments().catch(console.error);
    }

    private async loadAllSegments() {
        // Wait for all segments to load
        await Promise.all(this.segments.map(segment => segment.load(this)));
        this.loaded = true;
        this.segmentPositions = this.calcSegmentPositions();
    }

    play() {
        if (!this.loaded || this.playing) return;
        
        if (this.currentSegmentIndex >= this.segments.length) {
            this.currentSegmentIndex = 0;
        }
        
        this.segments[this.currentSegmentIndex].play();
        this.playing = true;
    }

    update() {
        if (!this.loaded) return;

        if (this.lastWidth !== this.p.width) {
            this.segmentPositions = this.calcSegmentPositions();
            this.lastWidth = this.p.width;
        }
    }

    currentSegmentEnded() {
        this.currentSegmentIndex++;
        this.playing = false;
        if (this.currentSegmentIndex >= this.segments.length)
            this.onended();
    }

    keyTyped() {
        if (this.p.keyCode === 32) { // Space
            this.togglePlay();
        }
    }

    calcSegmentPositions() {
        const progressBarX = 70;
        const progressBarWidth = this.p.width - progressBarX - 30;
        let totalDuration = 0;
        for (let segment of this.segments) {
            totalDuration += segment.duration();
        }

        const result = []

        let currentX = progressBarX;
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const segmentDuration = segment.duration();
            const segmentWidth = (segmentDuration / totalDuration) * progressBarWidth;
            result.push([currentX, segmentWidth]);

            currentX += segmentWidth;
        }

        return result;
    }

    draw() {
        const barHeight = 60;
        const barY = this.p.height - barHeight;
        const playButtonSize = 40;
        const playButtonX = 30;
        const playButtonY = barY + barHeight / 2;

        // Progress bar position (starts after play button)
        const progressBarX = 70;
        const progressBarWidth = this.p.width - progressBarX - 30;
        const progressBarHeight = 20;
        const progressBarY = barY + barHeight / 2 - progressBarHeight / 2;

        // Draw play/pause button
        this.p.fill(100);
        this.p.stroke(50);
        this.p.strokeWeight(2);
        this.p.circle(playButtonX, playButtonY, playButtonSize);

        this.p.fill(255);
        this.p.noStroke();
        
        if (!this.loaded) {
            // Show loading indicator
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.fill(255);
            this.p.text("...", playButtonX, playButtonY);
        } else if (!this.playing) {
            // Play button (triangle)
            this.p.triangle(
                playButtonX - 6, playButtonY - 10,
                playButtonX - 6, playButtonY + 10,
                playButtonX + 8, playButtonY
            );
        } else {
            // Pause button (two rectangles)
            this.p.rect(playButtonX - 8, playButtonY - 10, 6, 20);
            this.p.rect(playButtonX + 2, playButtonY - 10, 6, 20);
        }

        if (!this.loaded) {
            return;
        }

        // Draw background bar
        this.p.fill(150);
        this.p.noStroke();
        this.p.rect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 5);

        // Draw segments
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const [currentX, segmentWidth] = this.segmentPositions[i];

            // Draw segment background
            if (i < this.currentSegmentIndex) {
                // Completed segment
                this.p.fill(100, 200, 100);
            } else if (i === this.currentSegmentIndex) {
                // Current segment
                this.p.fill(100, 150, 255);
            } else {
                // Future segment
                this.p.fill(200);
            }

            this.p.rect(currentX, progressBarY, segmentWidth, progressBarHeight, 5);

            // Draw current segment progress
            if (i === this.currentSegmentIndex) {
                const progress = segment.currentTime() / segment.duration();
                this.p.fill(50, 100, 200);
                this.p.rect(currentX, progressBarY, segmentWidth * progress, progressBarHeight, 5);
            }

            // Draw segment separator
            this.p.stroke(100);
            this.p.strokeWeight(1);
            if (i < this.segments.length - 1) {
                this.p.line(currentX + segmentWidth, progressBarY, currentX + segmentWidth, progressBarY + progressBarHeight);
            }
        }
    }

    async handleClick(mx: number, my: number) {
        if (!this.loaded) {
            return;
        }
        
        const barHeight = 60;
        const barY = this.p.height - barHeight;
        const playButtonSize = 40;
        const playButtonX = 30;
        const playButtonY = barY + barHeight / 2;

        // Check if click is on play button
        const d = this.p.dist(mx, my, playButtonX, playButtonY);
        if (d < playButtonSize / 2) {
            await this.togglePlay();
            return;
        }

        // Progress bar position
        const progressBarX = 70;
        const progressBarWidth = this.p.width - progressBarX - 30;
        const progressBarHeight = 20;
        const progressBarY = barY + barHeight / 2 - progressBarHeight / 2;

        if (mx >= progressBarX && mx <= progressBarX + progressBarWidth &&
            my >= progressBarY && my <= progressBarY + progressBarHeight) {

            // Find which segment was clicked
            for (let i = 0; i < this.segments.length; i++) {
                const [segmentX, segmentWidth] = this.segmentPositions[i];
                if (mx >= segmentX && mx <= segmentX + segmentWidth) {
                    // Stop current segment
                    if (this.playing && this.currentSegmentIndex < this.segments.length) {
                        this.segments[this.currentSegmentIndex].stop();
                    }

                    this.currentSegmentIndex = i;
                    const segment = this.segments[i];
                    const clickPosInSegment = mx - segmentX;
                    const jumpTime = (clickPosInSegment / segmentWidth) * segment.duration();
                    segment.seek(jumpTime);
                    if (this.playing) segment.play();
                    break;
                }
            }
        }
    }

    togglePlay() {
        if (!this.playing) {
            this.play();
        } else {
            this.pause();
        }
    }

    pause() {
        this.playing = false;
        this.segments[this.currentSegmentIndex].pause();
    }

}

export class AudioSegment {
    private audioCtx: AudioContext;
    private filename: string;
    private audioPlayer: AudioPlayer | null = null;
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
    async load(audioPlayer: AudioPlayer) {
        this.audioPlayer = audioPlayer;
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
                if (this.audioPlayer) this.audioPlayer.currentSegmentEnded();
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
        this.source!.stop();
        this.source = null;
        this.playing = false;
    }

    /**
     * Stops the audio segment. Another call to play() will restart playback from the beginning.
     */
    stop() {
        if (!this.isLoaded() || !this.playing) return;
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
     * Executes a function when the audio segment reaches the given duration.
     *
     * @param duration Duration in seconds.
     * @param f Function to execute.
     */
    addCue(duration: number, f: () => void): AudioSegment {
        // TODO
        return this;
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
