import {Context} from "../context";
import p5 from "p5";
import {INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "./element";
import {Rect} from "../collision";

/**
 * If a single number is provided, it represents the height in dkwdp-coordinates.
 * If an array of two numbers is provided, it represents the width and height in dkwdp-coordinates.
 */
export type SpriteSize = number | [number, number];
export interface SpriteParams {
    size?: SpriteSize;
    rotation?: number;
    alpha?: number;
    imageMode?: "corner" | "center" | "corners";
}

export class Sprite implements InteractiveElement {
    _interactiveElementMarker: "interactiveElement" = INTERACTIVE_ELEMENT_MARKER;

    filename: string;

    x: number;
    y: number;

    /** The absolute size of the sprite in dkwdp-coordinates.
     * If a single number is provided, it represents the height.
     * If an array of two numbers is provided, it represents the width and height.
     */
    size: SpriteSize;
    /**
     * Rotation in radians.
     */
    rotation: number;
    /**
     * Alpha value between 0 and 1.
     */
    alpha: number;
    /**
     * Image rendering mode. Default is "center".
     * corner: draws the sprite from the top-left corner.
     * center: draws the sprite from the center.
     * corners: draws the sprite from the top-left and bottom-right corners.
     */
    imageMode: "corner" | "center" | "corners";

    constructor(filename: string, x: number, y: number, {size = 3.0, rotation = 0, alpha = 1.0, imageMode = "center"}: SpriteParams = {}) {
        this.filename = filename;
        this.x = x;
        this.y = y;
        this.size = size;
        this.rotation = rotation;
        this.alpha = alpha;
        this.imageMode = imageMode;
    }

    update(context: Context) {}

    touches(x: number, y: number, context: Context): boolean {
        // TODO: respect rotation
        const image = context.spriteBuffer.get(this.filename);
        if (!image) {
            console.error(`Sprite image not found: ${this.filename}`);
            return false;
        }

        const [width, height] = this.getImageSize(image);
        const collisionRect = Rect.fromMode(this.x, this.y, width, height, this.imageMode);

        if (collisionRect.collidesPoint(x, y)) {
            // Calculate relative position within the sprite (0 to 1)
            const [xRel, yRel] = collisionRect.pointInRectRelative(x, y);

            // Map to pixel coordinates in the image
            const pixelX = Math.floor(xRel * image.width);
            const pixelY = Math.floor(yRel * image.height);

            // Get pixel color at the position
            const pixelColor = image.get(pixelX, pixelY);

            // Check alpha channel (index 3 in RGBA array)
            const alpha = context.alpha(pixelColor);

            // Return true if pixel is not transparent (alpha > threshold)
            return alpha > 128;
        }
        return false;
    }

    getImageSize(image: p5.Image): [number, number] {
        if (typeof this.size === 'number') {
            const aspectRatio = image.width / image.height;
            return [this.size * aspectRatio, this.size];
        } else {
            return this.size;
        }
    }

    draw(context: Context) {
        const image = context.spriteBuffer.get(this.filename);
        if (image) {
            context.push();
            if (this.alpha < 1.0)
                context.tint(255, this.alpha * 255);
            // we flip y position here
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            context.imageMode(this.imageMode);
            const [w, h] = this.getImageSize(image);
            context.image(image, 0, 0, w, h);
            context.pop();
        } else {
            console.error(`Sprite image not found: ${this.filename}`);
        }
    }
}