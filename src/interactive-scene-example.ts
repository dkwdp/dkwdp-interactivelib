import {RenderContext, AudioEngine} from "./scene-player";
import {Scene} from "./scene";
import {Audio} from "./audio";

export class InteractiveSceneExample implements Scene {
    private x: number = 1;
    private direction: number = 2;

    update(_time: number, renderContext: RenderContext, audioEngine: AudioEngine): Audio[] {
        if (this.x <= -200) {
            this.direction = 2;
            audioEngine.playAudio("assets/meow.mp3");
        }
        if (this.x >= 200) {
            this.direction = -2;
        }
        this.x += this.direction;

        renderContext.renderSprite("assets/cat.png", this.x, 50, 0.2);

        return [];
    }

    duration(): number {
        return -1;
    }
}