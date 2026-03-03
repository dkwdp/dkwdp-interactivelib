import {AudioEngine, RenderContext} from "./scene-player";

export interface InteractiveScene {
    /**
     * Updates and renders the scene
     * @param renderContext Context holding the p5 instance used for rendering and the sprite buffer.
     * @param audioEngine Audio engine used for playing audio.
     * @returns The name of the next scene, or null if the scene is complete.
     */
    update(renderContext: RenderContext, audioEngine: AudioEngine): void;
}