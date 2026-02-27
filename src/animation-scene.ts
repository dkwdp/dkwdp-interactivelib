import {SceneState} from "./scene-state";

export interface AnimationScene {
    /**
     * Creates a Render object that shows the current state at the given time.
     * @param time A timestamp in seconds. Starts at 0 and increases up to duration()
     */
    render(time: number): SceneState;
    duration(): number;
}