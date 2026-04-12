export class Rect {
    /** Center x coordinate. */
    x: number;
    /** Center y coordinate. */
    y: number;
    /** Width. */
    width: number;
    /** Height. */
    height: number;

    /**
     * Creates a new CollisionRect instance.
     * @param x The center x-coordinate.
     * @param y The center y-coordinate.
     * @param width The width.
     * @param height The height.
     */
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Creates a new CollisionRect instance based on the provided image mode.
     * @param x The x position defined by the image mode.
     * @param y The y position defined by the image mode.
     * @param width The width defined by the image mode.
     * @param height The height defined by the image mode.
     * @param mode One of the following modes: "center", "corner", "corners", "radius".
     * If "center", the rect is centered at (x, y) and width and height are the width and height.
     * If "corner", the rect (x, y) position is the top left corner of the image.
     * If "corners", the rect (x, y) position is the top left corner of the image and width and height are the right and bottom positions of the image.
     * If "radius", the rect is centered at (x, y) and has a width and height of 2 * radius.
     */
    static fromMode(x: number, y: number, width: number, height: number, mode: "center" | "corner" | "corners" | "radius"): Rect {
        switch (mode) {
            case "center":
                return new Rect(x, y, width, height);
            case "corner":
                return new Rect(x + width / 2, y - height / 2, width, height);
            case "corners":
                return new Rect((x + width) / 2, (y + height) / 2, Math.abs(width - x), Math.abs(height - y));
            case "radius":
                return new Rect(x, y, width * 2, height * 2);
        }
    }

    /**
     * Creates a new CollisionRect instance based on the provided text align.
     * @param x The x position defined by the image mode.
     * @param y The y position defined by the image mode.
     * @param width The width defined by the image mode.
     * @param height The height defined by the image mode.
     * @param horizAlign One of the following modes: "left", "center", "right", defining the interpretation of the
     * given values.
     * If "left", x is the left position of the text.
     * If "center", the x position is the center of the text.
     * If "right", the x position is the right position of the text.
     * @param vertAlign One of the following modes: "top", "center", "bottom", "alphabetic", defining the interpretation of the
     * given values.
     * If "top", y is the top position of the text.
     * If "center", the y position is the center of the text.
     * If "bottom", the y position is the bottom position of the text.
     * If "alphabetic", the y position is the alphabetic baseline of the text.
     */
    static fromTextAlign(
        x: number, y: number, width: number, height: number,
        horizAlign: "left" | "center" | "right", vertAlign: "top" | "center" | "bottom" | "alphabetic"
    ): Rect {
        let xRect;
        switch (horizAlign) {
            case "left":
                xRect = x + width / 2;
                break;
            case "center":
                xRect = x;
                break;
            case "right":
                xRect = x - width / 2;
                break;
        }
        let yRect;
        switch (vertAlign) {
            case "top":
                yRect = y - height / 2;
                break;
            case "center":
                yRect = y;
                break;
            case "bottom":
                yRect = y + height / 2;
                break;
            case "alphabetic":
                yRect = y + height / 2;
                break;
        }
        return new Rect(xRect, yRect, width, height);
    }

    collidesRect(other: Rect): boolean {
        return (
            this.minX <= other.maxX &&
            other.minX <= this.maxX &&
            this.minY <= other.maxY &&
            other.minY <= this.maxY
        );
    }

    collidesPoint(x: number, y: number): boolean {
        return (
            this.minX <= x &&
            this.maxX >= x &&
            this.minY <= y &&
            this.maxY >= y
        );
    }

    get minX(): number {
        return this.x - this.width / 2;
    }

    get maxX(): number {
        return this.x + this.width / 2;
    }

    get minY(): number {
        return this.y - this.height / 2;
    }

    get maxY(): number {
        return this.y + this.height / 2;
    }

    /**
     * Calculates the position of a point to the minX, minY point.
     */
    pointInRect(x: number, y: number): [number, number] {
        return [x - this.minX, y - this.minY];
    }

    /**
     * Calculates the relative position of a point inside this rect.
     */
    pointInRectRelative(x: number, y: number): [number, number] {
        return [(x - this.minX) / this.width, (y - this.minY) / this.height];
    }
}