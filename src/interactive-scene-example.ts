import {RenderContext, AudioEngine} from "./scene-player";
import {Scene, SceneUpdate} from "./scene";
import {Evt} from "./event";
import {Sprite} from "./sprite";

export class InteractiveSceneExample extends Scene {
    private x: number = 1;
    private y: number = 1;
    private direction: number = 2;

    update(_time: number, renderContext: RenderContext, audioEngine: AudioEngine, events: Evt[]): SceneUpdate {
        if (this.x <= -200) {
            this.direction = 2;
            audioEngine.playAudio("assets/meow.mp3");
        }
        if (this.x >= 200) {
            this.direction = -2;
        }
        this.x += this.direction;

        for (const ev of events) {
            console.log(ev);
            if (ev.kind === 'mousemove') {
                this.y = ev.y;
            }
        }

        new Sprite("assets/cat.png", this.x, this.y, 0.2).draw(renderContext);

        return SceneUpdate.empty();
    }

    duration(): number {
        return -1;
    }
}