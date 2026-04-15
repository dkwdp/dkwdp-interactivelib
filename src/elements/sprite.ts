import {Context, ContextNotProvidedError} from "../context";
import p5 from "p5";
import {InteractiveElement} from "./interactive-element";
import {Rect} from "../element-helpers/rect";

/**
 * If a single number is provided, it represents the height in dkwdp-coordinates.
 * If an array of two numbers is provided, it represents the width and height in dkwdp-coordinates.
 */
export type SpriteSize = number | [number, number];
export type ImageMode = "corner" | "center" | "radius";
export interface SpriteParams {
    size?: SpriteSize;
    rotation?: number;
    alpha?: number;
    imageMode?: ImageMode;
}

export class Sprite extends InteractiveElement {
    filename: string;

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
    imageMode: ImageMode;

    constructor(filename: string, x: number, y: number, {size = 3.0, rotation = 0, alpha = 1.0, imageMode = "center"}: SpriteParams = {}) {
        super(x, y);
        this.filename = filename;
        this.size = size;
        this.rotation = rotation;
        this.alpha = alpha;
        this.imageMode = imageMode;
    }

    update(context: Context) {
        super.update(context);
    }

    touches(x?: number, y?: number): boolean {
        if (this._context === null) throw new ContextNotProvidedError();

        if (x === undefined) x = this._context.mousePos.x;
        if (y === undefined) y = this._context.mousePos.y;

        // Transform click point to sprite's local coordinate system (inverse rotation)
        const dx = x - this.x;
        const dy = y - this.y;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const localX = this.x + (dx * cos - dy * sin);
        const localY = this.y + (dx * sin + dy * cos);

        const collisionRect = this.getBoundingBox();

        if (collisionRect.collidesPoint(localX, localY)) {
            const image = this.getImage();
            if (!image) {
                console.error(`Sprite image not found: ${this.filename}`);
                return false;
            }
            // Calculate relative position within the sprite (0 to 1)
            const [xRel, yRel] = collisionRect.pointInRectRelative(localX, localY);

            // Map to pixel coordinates in the image
            const pixelX = Math.floor(xRel * image.width);
            const pixelY = Math.floor((1 - yRel) * image.height);

            // Get pixel color at the position
            const pixelColor = image.get(pixelX, pixelY);

            // Check alpha channel (index 3 in RGBA array)
            const alpha = this._context.alpha(pixelColor);

            // Return true if pixel is not transparent (alpha > threshold)
            return alpha > 128;
        }
        return false;
    }

    private getImage(): p5.Image {
        const image = this.getContext().spriteBuffer.get(this.filename);
        if (!image) {
            console.error(`Sprite image not found: ${this.filename}`);
        }
        return image;
    }

    getBoundingBox(): Rect {
        // convert radius -> center, because getImageSize already doubles image size, if radius is used.
        let imageMode = this.imageMode;
        if (imageMode === 'radius') {
            imageMode = 'center';
        }
        const [width, height] = this.getImageSize();
        return Rect.fromMode(this.x, this.y, width, height, imageMode);
    }

    getImageSize(): [number, number] {
        let size: [number, number];
        if (typeof this.size === 'number') {
            const image = this.getImage();
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

    draw() {
        if (this._context === null) throw new ContextNotProvidedError();

        const image = this._context.spriteBuffer.get(this.filename);
        if (image) {
            this._context.push();
            if (this.alpha < 1.0)
                this._context.tint(255, this.alpha * 255);
            // we flip y position here
            this._context.translate(this.x, this.y);
            this._context.rotate(this.rotation);
            let imageMode = this.imageMode;
            if (imageMode === 'radius') {
                imageMode = 'center';
            }
            this._context.imageMode(imageMode);
            const [w, h] = this.getImageSize();
            this._context.image(image, 0, 0, w, h);
            this._context.pop();
        } else {
            console.error(`Sprite image not found: ${this.filename}`);
        }
    }

    changeSize(scale: number) {
        if (Array.isArray(this.size)) {
            this.size = [this.size[0] * scale, this.size[1] * scale];
        } else {
            this.size *= scale;
        }
    }

    handleEdit(c: Context, mode: "normal" | "edit") {
        super.handleEdit(c, mode);
        if (mode === "normal") {
            if (c.keyJustPressed("+")) {
                this.changeSize(1.2);
            } else if (c.keyJustPressed("-")) {
                this.changeSize(1 / 1.2);
            }
        }
    }

    getSourceCode(): string {
        return `spriteName: Sprite = new Sprite("${this.filename}", ${this.x.toFixed(2)}, ${this.y.toFixed(2)}, {size: ${this.size}, imageMode: "${this.imageMode}", rotation: ${this.rotation.toFixed(2)}, alpha: ${this.alpha}});`;
    }

    dump(): any {
        return {
            visible: this.visible,
            filename: this.filename,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            alpha: this.alpha,
            imageMode: this.imageMode,
        }
    }

    load(data: any): void {
        this.visible = data.visible;
        this.filename = data.filename;
        this.x = data.x;
        this.y = data.y;
        this.rotation = data.rotation;
        this.alpha = data.alpha;
        this.imageMode = data.imageMode;
    }
}