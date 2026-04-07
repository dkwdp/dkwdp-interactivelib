import {Context} from "../context";
import {INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "./element";

export interface LabelParams {
    fontsize?: number;
    horizAlign?: "left" | "center" | "right";
    vertAlign?: "top" | "center" | "bottom" | "alphabetic";
    rotation?: number;
    alpha?: number;
}

export class Label implements InteractiveElement {
    _interactiveElementMarker: "interactiveElement" = INTERACTIVE_ELEMENT_MARKER;

    visible: boolean = true;

    text: string;

    x: number;
    y: number;

    fontsize: number;

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

    constructor(text: string, x: number, y: number, {fontsize = 12, horizAlign = "left", vertAlign = "top", rotation = 0, alpha = 0}: LabelParams = {}) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontsize = fontsize;
        this.horizAlign = horizAlign;
        this.vertAlign = vertAlign;
        this.rotation = rotation;
        this.alpha = alpha;
    }

    update(_context: Context) {}

    draw(c: Context) {
        c.push();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        if (this.alpha < 1.0)
            c.tint(255, this.alpha * 255);
        c.textSize(this.fontsize);
        c.textAlign(this.horizAlign, this.vertAlign);
        c.text(this.text, 0, 0);
        c.pop();
    }
}