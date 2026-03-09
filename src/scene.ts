import {Audio} from "./audio";
import {AudioEngine, RenderContext} from "./scene-player";
import {Evt} from "./event";

export class SceneUpdate {
    audios: Audio[];
    nextScene: string | null;

    constructor(audios: Audio[], nextScene: string | null = null) {
        this.audios = audios;
        this.nextScene = nextScene;
    }

    static empty(): SceneUpdate {
        return new SceneUpdate([], null);
    }
}

export abstract class Scene {
    /**
     * Initializes the application with the specified time, render context, and audio engine.
     *
     * @param renderContext - The rendering context to be used for rendering graphics.
     * @param audioEngine - The audio engine instance used for managing sound and music playback.
     */
    init(renderContext: RenderContext, audioEngine: AudioEngine): void {}

    // TODO: return void. And add Audios[] interface to AudioEngine. Add nextScene to EventManager
    /**
     * Creates a Render object that shows the current state at the given time.
     * @param time A timestamp in seconds. Starts at 0 and increases up to duration()
     * @param renderContext Context holding the p5 instance used for rendering and the sprite buffer.
     * @param audioEngine Audio engine used for playing audio.
     * @param events List of events that occurred in the last frame.
     * @returns A list of audios, where each file includes a predefined seek point.
     * Upon activation, the player skips the initial audio data and begins playback directly from the specified timestamp.
     */
    abstract update(time: number, renderContext: RenderContext, audioEngine: AudioEngine, events: Evt[]): SceneUpdate;

    /**
     * Returns the duration of the scene in seconds. If the duration is not defined or can vary, return -1.
     */
    duration(): number {
        return -1;
    }
}

