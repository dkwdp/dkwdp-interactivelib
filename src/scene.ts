import {Context} from "./context";

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
     * @param context The context used for timing, rendering, audio playback, events and scene changes.
     */
    abstract update(context: Context): void;

    /**
     * Returns the duration of the scene in seconds. If the duration is not defined or can vary, return -1.
     */
    duration(): number {
        return -1;
    }
}

