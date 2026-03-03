import {InteractiveScene} from "./interactive-scene";
import {RenderContext, AudioEngine} from "./scene-player";

class InteractiveSceneExample implements InteractiveScene {
    private x: number = 1;
    private direction: number = 2;

    update(renderContext: RenderContext, audioEngine: AudioEngine): void {
        if (this.x <= 0) {
            this.direction = 2;
            audioEngine.playAudio("assets/meow.mp3");
        }
        if (this.x >= 400) {
            this.direction = -2;
        }
        this.x += this.direction;

        renderContext.renderSprite("assets/cat.png", this.x, 50);
    }
}