import {Context} from "./context";

export abstract class Scene {
    /**
     * Initializes the application with the specified time, render context, and audio engine.
     *
     * @param _context - The context containing rendering helpers and audio playback.
     */
    init(_context: Context): void {}

    /**
     * Drops the current scene or resource associated with the provided context.
     *
     * @param {Context} _c The current context object.
     */
    drop(_c: Context): void {}

    /**
     * Calls update. Can be overwritten by subclasses to implement custom behavior.
     * @param context The context used for timing, rendering, audio playback, events, and scene changes.
     */
    call(context: Context) {
        this.update(context);
    }

    /**
     * Creates a Render object that shows the current state at the given time.
     * @param context The context used for timing, rendering, audio playback, events, and scene changes.
     */
    abstract update(context: Context): void;

    /**
     * Returns the duration of the scene in seconds. If the duration is not defined or can vary, return -1.
     */
    duration(): number {
        return -1;
    }
}
