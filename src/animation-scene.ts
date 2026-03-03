import {Audio} from "./audio";
import p5 from "p5";
import {Sprite} from "./sprite";
import {worldToScreen} from "./figure";
import {SpriteBuffer} from "./scene-player";

export class RenderContext {
    p: p5;
    spriteBuffer: SpriteBuffer;

    constructor(p: p5, spriteBuffer: SpriteBuffer) {
        this.p = p;
        this.spriteBuffer = spriteBuffer;
    }

    /**
     * Renders a sprite at the given position.
     * @param sprite The sprite to render.
     * @param x The x-coordinate of the sprite's center.
     * @param y The y-coordinate of the sprite's center.
     * @param size The size of the sprite.
     * @param rotation The rotation of the sprite in radians.
     *
     * TODO: use coordinate system, use rotation
     */
    renderSprite(sprite: string, x: number, y: number, size: number = 1.0, rotation: number = 0) {
        let image = this.spriteBuffer.get(sprite);
        let world_xy = worldToScreen(x, y, this.p);
        this.p.image(image, world_xy[0], world_xy[1], image.width * size, image.height * size);
    }
}

export interface AnimationScene {
    /**
     * Creates a Render object that shows the current state at the given time.
     * @param time A timestamp in seconds. Starts at 0 and increases up to duration()
     * @param renderContext Context holding the p5 instance used for rendering and the sprite buffer.
     * @returns A list of Audio objects, that should be played at the given time.
     */
    update(time: number, renderContext: RenderContext): Audio[];

    /**
     * Returns the duration of the scene in seconds.
     */
    duration(): number;
}

