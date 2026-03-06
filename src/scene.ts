import {Audio} from "./audio";
import {AudioEngine, RenderContext} from "./scene-player";

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

export interface Scene {
    /**
     * Creates a Render object that shows the current state at the given time.
     * @param time A timestamp in seconds. Starts at 0 and increases up to duration()
     * @param renderContext Context holding the p5 instance used for rendering and the sprite buffer.
     * @param audioEngine Audio engine used for playing audio.
     * @returns A list of audios, where each file includes a predefined seek point.
     * Upon activation, the player skips the initial audio data and begins playback directly from the specified timestamp.
     */
    update(time: number, renderContext: RenderContext, audioEngine: AudioEngine): SceneUpdate;

    /**
     * Returns the duration of the scene in seconds. If the duration is not defined or can vary, return -1.
     */
    duration(): number;
}

