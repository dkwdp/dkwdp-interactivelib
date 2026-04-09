import {Context} from "../context";
import {INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "./element";

export interface LabelParams {
    fontsize?: number;
    horizAlign?: "left" | "center" | "right";
    vertAlign?: "top" | "center" | "bottom" | "alphabetic";
    rotation?: number;
    alpha?: number;
    color?: [number, number, number];
}

export class Label implements InteractiveElement {
    _interactiveElementMarker: "interactiveElement" = INTERACTIVE_ELEMENT_MARKER;

    visible: boolean = true;

    text: string;

    x: number;
    y: number;

    fontsize: number;

    color: [number, number, number];

    /**
     * Image rendering mode. Default is "left".
     * left: draws the label left aligned
     * center: draws the label center aligned
     * radius: draws the label right aligned
     */
    horizAlign: "left" | "center" | "right" = "left";

    /**
     * Image rendering mode. Default is "top".
     * top: draws the label top aligned
     * center: draws the label center aligned
     * bottom: draws the label bottom aligned
     * alphabetic: draws the label alphabetic aligned
     */
    vertAlign: "top" | "center" | "bottom" | "alphabetic";

    /**
     * Rotation in radians.
     */
    rotation: number;

    /**
     * Alpha value between 0 and 1.
     */
    alpha: number;

    private _clicked: boolean = false;
    private _hovered: boolean = false;

    constructor(text: string, x: number, y: number, {fontsize = 12, horizAlign = "left", vertAlign = "top", rotation = 0, alpha = 0, color = [0, 0, 0]}: LabelParams = {}) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontsize = fontsize;
        this.horizAlign = horizAlign;
        this.vertAlign = vertAlign;
        this.rotation = rotation;
        this.alpha = alpha;
        this.color = color;
    }

    touches(c: Context, x?: number, y?: number): boolean {
        if (x === undefined) x = c.mousePos.x;
        if (y === undefined) y = c.mousePos.y;

        // Measure text dimensions
        c.push();
        c.textSize(this.fontsize);
        c.textAlign(this.horizAlign, this.vertAlign);
        const metrics = c.fontBounds(this.text, this.x, this.y);
        c.pop();

        // Apply alignment offsets
        let offsetX = 0;
        if (this.horizAlign === "center") offsetX = -metrics.w / 2;
        else if (this.horizAlign === "right") offsetX = -metrics.w;

        let offsetY = 0;
        if (this.vertAlign === "top") offsetY = -metrics.h / 2;
        else if (this.vertAlign === "center") offsetY = -metrics.h / 2;
        else if (this.vertAlign === "bottom") offsetY = -metrics.h;
        else if (this.vertAlign === "alphabetic") offsetY = -metrics.h;

        // Transform point to local coordinates (inverse of rotation and translation)
        const dx = x - this.x;
        const dy = -(y - this.y); // TODO: fix this correctly
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Check if point is within text bounds
        return localX >= offsetX && localX <= offsetX + metrics.w &&
               localY >= offsetY * 0.2 && localY <= offsetY + metrics.h; // TODO: fix this correctly
    }

    update(c: Context) {
        this._clicked = false;
        this._hovered = this.touches(c);
        for (const evt of c.events) {
            if (evt.kind === "mousedown") {
                if (this._hovered) {
                    this._clicked = true;
                    break;
                }
            }
        }
    }

    get hovered(): boolean {
        return this._hovered;
    }

    get clicked(): boolean {
        return this._clicked;
    }

    draw(c: Context) {
        c.push();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        if (this.alpha < 1.0)
            c.tint(255, this.alpha * 255);
        c.textSize(this.fontsize);
        c.textAlign(this.horizAlign, this.vertAlign);
        c.fill(this.color[0], this.color[1], this.color[2]);
        c.text(this.text, 0, 0);
        c.pop();
    }
}