import p5 from 'p5';
import * as Tone from "tone";

export class AudioPlayer {
    private p: p5;
    private segments: AudioSegment[];
    private currentSegmentIndex: number;
    private playing: boolean;
    private nextStartTime: number;
    public onFinished: () => void;
    private lastWidth: number;
    private segmentPositions: number[][];
    private loaded: boolean = false;

    constructor(p: p5, segments: AudioSegment[]) {
        this.p = p;
        this.segments = segments;
        // index of next segment to play or current segment being played
        this.currentSegmentIndex = 0;
        this.playing = false;
        this.nextStartTime = 0.0;
        this.onFinished = () => {};
        this.lastWidth = p.width;
        this.segmentPositions = [];
        
        // Start loading all segments
        this.loadAllSegments();
    }

    private async loadAllSegments() {
        // Wait for all segments to load
        await Promise.all(this.segments.map(segment => segment.ensureLoaded()));
        this.loaded = true;
        this.segmentPositions = this.calcSegmentPositions();
    }

    async play() {
        if (!this.loaded) {
            await this.loadAllSegments();
        }
        
        if (this.playing) {
            return;
        }
        if (this.currentSegmentIndex >= this.segments.length) {
            this.currentSegmentIndex = 0;
        }
        
        // Ensure Tone.js audio context is started
        await Tone.start();
        
        await this.segments[this.currentSegmentIndex].play(this.nextStartTime);
        this.nextStartTime = 0.0;
        this.playing = true;
    }

    update() {
        if (!this.loaded) {
            return;
        }
        
        if (this.lastWidth !== this.p.width) {
            this.segmentPositions = this.calcSegmentPositions();
            this.lastWidth = this.p.width;
        }
        if (!this.playing) {
            return;
        }
        if (this.currentSegmentIndex >= this.segments.length) {
            return;
        }
        if (!this.segments[this.currentSegmentIndex].isPlaying) {
            this.currentSegmentIndex++;
            this.playing = false;
            if (this.currentSegmentIndex >= this.segments.length) {
                this.onFinished();
            }
        }
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
                let currentTime = this.nextStartTime;
                if (segment.isPlaying) {
                    currentTime = segment.currentTime();
                }
                const segmentDuration = segment.duration();
                const progress = currentTime / segmentDuration;
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

                    if (this.playing) {
                        await segment.play(jumpTime);
                    } else {
                        this.nextStartTime = jumpTime;
                    }
                    break;
                }
            }
        }
    }

    async togglePlay() {
        if (!this.playing) {
            await this.play();
        } else {
            this.pause();
        }
    }

    pause() {
        this.playing = false;
        this.nextStartTime = this.segments[this.currentSegmentIndex].currentTime();
        this.segments[this.currentSegmentIndex].stop();
    }

    dispose() {
        this.segments.forEach(segment => segment.dispose());
    }
}

export class AudioSegment {
    private player: Tone.Player | null = null;
    public isPlaying: boolean = false;
    private filename: string;
    private _duration: number = 0;
    private startOffset: number = 0;
    private startTime: number = 0;
    private onEndCallback: (() => void) | null = null;
    private loadPromise: Promise<void> | null = null;

    constructor(filename: string) {
        this.filename = filename;
        this.loadPromise = this.loadAudio();
    }

    private async loadAudio(): Promise<void> {
        this.player = new Tone.Player(this.filename).toDestination();
        await Tone.loaded();
        this._duration = this.player.buffer.duration;
    }

    async ensureLoaded(): Promise<void> {
        if (this.loadPromise) {
            await this.loadPromise;
        }
    }

    duration(): number {
        return this._duration;
    }

    async play(startTime: number = 0): Promise<void> {
        await this.ensureLoaded();
        
        if (this.player) {
            this.startOffset = startTime;
            this.startTime = Tone.now();
            this.player.start(0, startTime);
            this.isPlaying = true;
            
            // Set up callback for when playback finishes
            const remainingTime = this._duration - startTime;
            setTimeout(() => {
                this.isPlaying = false;
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            }, remainingTime * 1000);
        }
    }

    /**
     * Executes a function when the audio segment reaches the given duration.
     *
     * @param duration Duration in seconds.
     * @param f Function to execute.
     */
    addCue(duration: number, f: () => void): AudioSegment {
        return this;
    }

    then(f: () => void) {
        this.onEndCallback = f;
        return this;
    }


    stop() {
        if (this.player) {
            this.player.stop();
            this.isPlaying = false;
        }
    }

    currentTime(): number {
        if (!this.player || !this.isPlaying) {
            return this.startOffset;
        }
        
        const elapsed = Tone.now() - this.startTime;
        return this.startOffset + elapsed;
    }

    dispose() {
        if (this.player) {
            this.player.dispose();
        }
    }
}
