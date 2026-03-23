import p5 from "p5";
import {Scene} from "./scene";
import {ScenePlayer} from "./scene-player";

export * from "./scene-player";
export * from "./scene";
export * from "./sprite";
export * from "./context";

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
