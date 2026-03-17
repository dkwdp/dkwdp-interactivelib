import {Context} from "./scene";
import p5 from "p5";

/**
 * If a single number is provided, it represents the height in dkwdp-coordinates.
 * If an array of two numbers is provided, it represents the width and height in dkwdp-coordinates.
 */
export type SpriteSize = number | [number, number];

export class Sprite {
    filename: string;

    // TODO: change to coordinate system
    x: number;
    y: number;

    /** The absolute size of the sprite in dkwdp-coordinates. */
    size: SpriteSize;
    rotation: number;
    alpha: number; // alpha between 0 and 1

    constructor(filename: string, x: number, y: number, size: SpriteSize = 3.0, rotation: number = 0, alpha: number = 1.0) {
        this.filename = filename;
        this.x = x;
        this.y = y;
        this.size = size;
        this.rotation = rotation;
        this.alpha = alpha;
    }

    touches(x: number, y: number, context: Context): boolean {
        // TODO: respect rotation
        const image = context.spriteBuffer.get(this.filename);
        if (!image) {
            console.error(`Sprite image not found: ${this.filename}`);
            return false;
        }
        // const width = image.width * this.size;
        // const height = image.height * this.size;
        // TODO: rework this
        const width = image.width;
        const height = image.height;

        if (this.x - width / 2 <= x && this.x + width / 2 >= x && this.y - height / 2 <= y && this.y + height / 2 >= y) {
            if (image) {
                // Calculate relative position within the sprite (0 to 1)
                const relativeX = (x - (this.x - width / 2)) / width;
                const relativeY = (y - (this.y - height / 2)) / height;

                // Map to pixel coordinates in the image
                const pixelX = Math.floor(relativeX * image.width);
                const pixelY = Math.floor(relativeY * image.height);

                // Get pixel color at the position
                const pixelColor = image.get(pixelX, pixelY);

                // Check alpha channel (index 3 in RGBA array)
                const alpha = context.p.alpha(pixelColor);

                // Return true if pixel is not transparent (alpha > threshold)
                return alpha > 128;
            }
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
        const p = context.p;
        const image = context.spriteBuffer.get(this.filename);
        if (image) {
            p.push();
            if (this.alpha < 1.0)
                p.tint(255, this.alpha * 255);
            p.translate(this.x, this.y);
            p.rotate(this.rotation);
            p.imageMode(p.CENTER);
            const [w, h] = this.getImageSize(image);
            p.image(image, 0, 0, w, h);
            p.pop();
        } else {
            console.error(`Sprite image not found: ${this.filename}`);
        }
    }
}