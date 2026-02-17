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

    constructor(p: p5, segments: AudioSegment[]) {
        this.p = p;
        this.segments = segments;
        // index of next segment to play or current segment being played
        this.currentSegmentIndex = 0;
        this.playing = false;
        this.nextStartTime = 0.0;
        this.onFinished = () => {};

        this.lastWidth = p.width;
        // List of [x, width] pairs for each segment
        this.segmentPositions = this.calcSegmentPositions();
    }

    play() {
        if (this.playing) {
            return;
        }
        if (this.currentSegmentIndex >= this.segments.length) {
            this.currentSegmentIndex = 0;
        }
        this.segments[this.currentSegmentIndex].play(0.0, 1.0, 1.0, this.nextStartTime);
        this.nextStartTime = 0.0;
        this.playing = true;
    }

    update() {
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
        if (!this.playing) {
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

    handleClick(mx: number, my: number) {
        const barHeight = 60;
        const barY = this.p.height - barHeight;
        const playButtonSize = 40;
        const playButtonX = 30;
        const playButtonY = barY + barHeight / 2;

        // Check if click is on play button
        const d = this.p.dist(mx, my, playButtonX, playButtonY);
        if (d < playButtonSize / 2) {
            this.togglePlay();
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
                        segment.play(0.0, 1.0, 1.0, jumpTime);
                    } else {
                        this.nextStartTime = jumpTime;
                    }
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
        this.nextStartTime = this.segments[this.currentSegmentIndex].currentTime();
        this.segments[this.currentSegmentIndex].file.stop();
    }
}

export class AudioSegment {
    // public file: p5.SoundFile;
    public file: any;
    public isPlaying: boolean;

    constructor(p: p5, filename: string) {
        this.file = p.createAudio(filename);
        this.isPlaying = false;
    }

    duration(): number {
        return this.file.duration();
    }

    play(...args: any[]): void{
        this.file.play(...args);
        this.isPlaying = true;
    }

    then(f: CallableFunction) {
        // this.file.onended((soundFile: p5.SoundFile) => {
        this.file.onended((soundFile: any) => {
            if (Math.abs(this.file.currentTime() - this.file.duration()) < 0.01) {
                f(soundFile);
            }
        });
        return this;
    }

    stop() {
        this.file.stop();
        this.isPlaying = false;
    }

    currentTime(): number {
        return this.file.time();
    }
}
