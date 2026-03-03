import {Audio} from "./audio";
import {RenderContext} from "./scene-player";

export interface AnimationScene {
    /**
     * Creates a Render object that shows the current state at the given time.
     * @param time A timestamp in seconds. Starts at 0 and increases up to duration()
     * @param renderContext Context holding the p5 instance used for rendering and the sprite buffer.
     * @returns A list of Audio objects, that should be played at the given time.
     */
    update(time: number, renderContext: RenderContext): Audio[];

    /**
     * Returns the duration of the scene in seconds.
     */
    duration(): number;
}

