import {RenderContext} from "./scene-player";

export class Sprite {
    filename: string;

    // TODO: change to coordinate system
    x: number;
    y: number;

    /** The relative size of the sprite. TODO: change to relative size in coordinate system */
    size: number;
    rotation: number;
    alpha: number; // alpha between 0 and 1

    constructor(filename: string, x: number, y: number, size: number = 1.0, rotation: number = 0, alpha: number = 1.0) {
        this.filename = filename;
        this.x = x;
        this.y = y;
        this.size = size;
        this.rotation = rotation;
        this.alpha = alpha;
    }

    touches(x: number, y: number, renderContext: RenderContext): boolean {
        // TODO: respect rotation
        if (this.x <= x && this.x + this.size >= x && this.y <= y && this.y + this.size >= y) {
            const image = renderContext.spriteBuffer.get(this.filename);
            if (image) {
                // Calculate relative position within the sprite (0 to 1)
                const relativeX = (x - this.x) / this.size;
                const relativeY = (y - this.y) / this.size;

                // Map to pixel coordinates in the image
                const pixelX = Math.floor(relativeX * image.width);
                const pixelY = Math.floor(relativeY * image.height);

                // Get pixel color at the position
                const pixelColor = image.get(pixelX, pixelY);

                // Check alpha channel (index 3 in RGBA array)
                const alpha = renderContext.p.alpha(pixelColor);

                // Return true if pixel is not transparent (alpha > threshold)
                return alpha > 128;
            }
        }
        return false;
    }

    draw(renderContext: RenderContext) {
        const p = renderContext.p;
        const image = renderContext.spriteBuffer.get(this.filename);
        if (image) {
            p.push();
            if (this.alpha < 1.0)
                p.tint(255, this.alpha * 255);
            p.translate(this.x, this.y);
            p.rotate(this.rotation);
            p.image(image, 0, 0, image.width * this.size, image.height * this.size);
            p.pop();
        } else {
            console.error(`Sprite image not found: ${this.filename}`);
        }
    }
}