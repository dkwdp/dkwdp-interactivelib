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
    imageMode?: "corner" | "center" | "radius";
}

export class Sprite implements InteractiveElement {
    _interactiveElementMarker: "interactiveElement" = INTERACTIVE_ELEMENT_MARKER;

    visible: boolean = true;

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
     * radius: draws the sprite from the center and size defines the radius.
     */
    imageMode: "corner" | "center" | "radius";

    private _clicked: boolean = false;

    constructor(filename: string, x: number, y: number, {size = 3.0, rotation = 0, alpha = 1.0, imageMode = "center"}: SpriteParams = {}) {
        this.filename = filename;
        this.x = x;
        this.y = y;
        this.size = size;
        this.rotation = rotation;
        this.alpha = alpha;
        this.imageMode = imageMode;
    }

    update(context: Context) {
        this._clicked = false;
        for (const evt of context.events) {
            if (evt.kind === "mousedown") {
                if (this.touches(evt.x, evt.y, context)) {
                    this._clicked = true;
                    break;
                }
            }
        }
    }

    touches(x: number, y: number, context: Context): boolean {
        const image = context.spriteBuffer.get(this.filename);
        if (!image) {
            console.error(`Sprite image not found: ${this.filename}`);
            return false;
        }

        const [width, height] = this.getImageSize(image);

        // Transform click point to sprite's local coordinate system (inverse rotation)
        const dx = x - this.x;
        const dy = y - this.y;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const localX = this.x + (dx * cos - dy * sin);
        const localY = this.y + (dx * sin + dy * cos);

        // convert radius -> center, because getImageSize already doubles image size, if radius is used.
        let imageMode = this.imageMode;
        if (imageMode === 'radius') {
            imageMode = 'center';
        }
        const collisionRect = Rect.fromMode(this.x, this.y, width, height, imageMode);

        if (collisionRect.collidesPoint(localX, localY)) {
            // Calculate relative position within the sprite (0 to 1)
            const [xRel, yRel] = collisionRect.pointInRectRelative(localX, localY);

            // Map to pixel coordinates in the image
            const pixelX = Math.floor(xRel * image.width);
            const pixelY = Math.floor((1 - yRel) * image.height);

            // Get pixel color at the position
            const pixelColor = image.get(pixelX, pixelY);

            // Check alpha channel (index 3 in RGBA array)
            const alpha = context.alpha(pixelColor);

            // Return true if pixel is not transparent (alpha > threshold)
            return alpha > 128;
        }
        return false;
    }

    get clicked(): boolean {
        return this._clicked;
    }

    getImageSize(image: p5.Image): [number, number] {
        let size: [number, number];
        if (typeof this.size === 'number') {
            const aspectRatio = image.width / image.height;
            size = [this.size * aspectRatio, this.size];
        } else {
            size = this.size
        }
        if (this.imageMode === 'radius') {
            size = [size[0] * 2, size[1] * 2];
        }
        return size;
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
            let imageMode = this.imageMode;
            if (imageMode === 'radius') {
                imageMode = 'center';
            }
            context.imageMode(imageMode);
            const [w, h] = this.getImageSize(image);
            context.image(image, 0, 0, w, h);
            context.pop();
        } else {
            console.error(`Sprite image not found: ${this.filename}`);
        }
    }
}