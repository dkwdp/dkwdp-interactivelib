export class Sprite {
    filename: string;

    // TODO: change to coordinate system
    x: number;
    y: number;

    /** The relative size of the sprite. TODO: change to relative size in coordinate system */
    size: number;
    rotation: number;

    constructor(spriteId: string, x: number, y: number, size: number = 1.0, rotation: number = 0) {
        this.filename = spriteId;
        this.x = x;
        this.y = y;
        this.size = size;
        this.rotation = rotation;
    }
}