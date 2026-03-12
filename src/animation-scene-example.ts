import {Scene, SceneUpdate} from "./scene";
import {Audio} from "./audio";
import {RenderContext} from "./scene-player";
import {Sprite} from "./sprite";

export class AnimationSceneExample extends Scene {
    duration(): number {
        return 2.0;
    }

    update(time: number, renderContext: RenderContext): SceneUpdate {
        if (time > this.duration()) return new SceneUpdate([], "scene1");

        const progress = time / this.duration();
        const x = 50 + Math.sin(progress * 2 * Math.PI * 2) * 20;
        const y = 50 + Math.cos(progress * 2 * Math.PI * 2) * 20;

        new Sprite("assets/cat.png", x, y, 0.2).draw(renderContext);

        return new SceneUpdate([new Audio("assets/01_intro.mp3", time)]);
    }
}