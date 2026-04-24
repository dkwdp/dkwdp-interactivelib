import p5 from "p5";
import {Scene} from "./scene";
import {ScenePlayer} from "./scene-player";

export * from "./scene-player";
export * from "./scene";
export * from "./elements/interactive-element";
export * from "./elements/sprite";
export * from "./elements/label";
export * from "./elements/multi-label";
export * from "./context";
export * from "./edit-scene";
export * from "./elements/effects";
export * from "./scenes/auto-draw-scene";
export * from "./event";
export * from "./element-helpers/rect";
export * from "./elements/div";

export function initScenes(
    parent: HTMLElement, sceneBuffer: [string, Scene][], preloadAudioAssets: string[] = [], preloadImageAssets: string[] = []
) {
    new p5((p) => {
        let scenePlayer: ScenePlayer;

        p.setup = () => {
            const canvasContainer = p.createDiv();
            canvasContainer.parent(parent);
            canvasContainer.id('scene-canvas-container');
            canvasContainer.style("position", "relative");

            const canvas = p.createCanvas();
            canvas.parent(canvasContainer);

            scenePlayer = new ScenePlayer(p, new Map<string, Scene>(sceneBuffer), sceneBuffer[0][0], canvas, canvasContainer);
            scenePlayer.load(preloadAudioAssets, preloadImageAssets).then(() => {});
        };

        p.draw = () => {
            scenePlayer.update();
        };
    });
}
