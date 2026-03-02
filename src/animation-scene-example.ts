import {AnimationScene} from "./animation-scene";
import {SceneState} from "./scene-state";
import {Sprite} from "./sprite";

export class AnimationSceneExample implements AnimationScene {
    private readonly _sprite: string;
    private readonly x: number;
    private readonly y: number;
    private readonly _duration: number;

    constructor(sprite: string, x: number, y: number, duration: number) {
        this._sprite = sprite;
        this.x = x;
        this.y = y;
        this._duration = duration;
    }

    duration(): number {
        return this._duration;
    }

    render(time: number): SceneState {
        if (time > this._duration) return new SceneState([], []);

        const progress = time / this._duration;
        const x = this.x + Math.sin(progress * 2 * Math.PI * 2) * 20;
        const y = this.y + Math.cos(progress * 2 * Math.PI * 2) * 20;
        const figure: Sprite = new Sprite(this._sprite, x, y, 0.2);

        return new SceneState([figure], []);
    }
}