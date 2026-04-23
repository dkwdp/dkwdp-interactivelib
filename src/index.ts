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

export function initScenes(parent: HTMLElement, sceneBuffer: [string, Scene][], audioAssets: string[], imageAssets: string[]) {
    new p5((p) => {
        let scenePlayer: ScenePlayer;

        p.setup = () => {
            p.createCanvas().parent(parent);
            scenePlayer = new ScenePlayer(p, new Map<string, Scene>(sceneBuffer), sceneBuffer[0][0]);
            scenePlayer.load(audioAssets, imageAssets).then(() => {});
        };

        p.draw = () => {
            scenePlayer.update();
        };
    });
}
