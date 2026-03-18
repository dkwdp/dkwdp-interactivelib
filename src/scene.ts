import {Audio, AudioPlayer, AudioBuf, SpriteBuffer} from "./media";
import {Evt} from "./event";
import p5 from "p5";
import {CoordinateSystem} from "./coordinates";

export class Context {
    readonly time: number;
    readonly globalTime: number;
    readonly p: p5;
    readonly spriteBuffer: SpriteBuffer;
    readonly events: Evt[];
    readonly coordinates: CoordinateSystem;

    // noinspection JSMismatchedCollectionQueryUpdate
    private readonly detachedAudioPlayers: AudioPlayer[];
    private readonly audioBuffer: AudioBuf;
    private readonly _audios: Audio[];

    nextScene: string | null;

    constructor(time: number, globalTime: number, p: p5, spriteBuffer: SpriteBuffer, audioPlayers: AudioPlayer[], audioBuffer: AudioBuf, events: Evt[], coordinates: CoordinateSystem) {
        this.time = time;
        this.globalTime = globalTime;
        this.p = p;
        this.spriteBuffer = spriteBuffer;
        this.detachedAudioPlayers = audioPlayers;
        this.audioBuffer = audioBuffer;
        this.events = events;
        this.coordinates = coordinates;
        this._audios = [];
        this.nextScene = null;
    }

    /**
     * Plays an audio file at the given offset.
     * @param filename The filename of the audio file to play.
     * @param offset The offset in seconds how much audio should be skipped at the start of the audiofile.
     * @param controlled If false, the audio will be played and will continue to play until the end of the audiofile.
     * If true, the audio will be played only one frame, and only continued, if playAudio() is called again with the same filename and the offset + delta time.
     */
    playAudio(filename: string, offset: number = 0, controlled: boolean = false) {
        if (!controlled) {
            const source = this.audioBuffer.get(filename);
            if (!source) throw new Error(`Audio file not found: ${filename}`);
            const player = source.createPlayer();
            player.play(offset, this.globalTime);
            this.detachedAudioPlayers.push(player);
        } else {
            this._audios.push(new Audio(filename, offset));
        }
    }

    get audios(): Audio[] {
        return this._audios;
    }
}

export abstract class Scene {
    /**
     * Initializes the application with the specified time, render context, and audio engine.
     *
     * @param context - The context containing rendering helpers and audio playback.
     */
    init(context: Context): void {}

    // TODO: return void. And add Audios[] interface to AudioEngine. Add nextScene to EventManager
    /**
     * Creates a Render object that shows the current state at the given time.
     * @param context The context used for timing, rendering, audio playback and scene changes.
     */
    abstract update(context: Context): void;

    /**
     * Returns the duration of the scene in seconds. If the duration is not defined or can vary, return -1.
     */
    duration(): number {
        return -1;
    }
}

