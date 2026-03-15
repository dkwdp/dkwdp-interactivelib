import p5 from "p5";
import {Scene} from "./scene";
import {ScenePlayer} from "./scene-player";

export * from "./scene-player";
export * from "./scene";
export * from "./sprite";

export function initScenes(sceneBuffer: [string, Scene][], audioAssets: string[], imageAssets: string[], width: number = 1920, height: number = 1080) {
    new p5((p) => {
        const sceneBufferMap = new Map<string, Scene>(sceneBuffer);
        let scenePlayer = new ScenePlayer(p, sceneBufferMap, sceneBuffer[0][0]);

        p.setup = () => {
            p.createCanvas(width, height).parent('sketch-holder');
            scenePlayer.load(audioAssets, imageAssets).then(() => {});
        };

        p.draw = () => {
            scenePlayer.update();
        };
    });
}
