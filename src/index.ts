import p5 from "p5";
import {Scene} from "./scene";
import {ScenePlayer} from "./scene-player";

export * from "./scene-player";
export * from "./scene";
export * from "./sprite";
export * from "./context";

export function initScenes(sceneBuffer: [string, Scene][], audioAssets: string[], imageAssets: string[]) {
    new p5((p) => {
        const sceneBufferMap = new Map<string, Scene>(sceneBuffer);
        let scenePlayer: ScenePlayer;

        p.setup = () => {
            p.createCanvas().parent('sketch-holder');
            scenePlayer = new ScenePlayer(p, sceneBufferMap, sceneBuffer[0][0]);
            scenePlayer.load(audioAssets, imageAssets).then(() => {});
        };

        p.draw = () => {
            scenePlayer.update();
        };
    });
}
