import {Context} from "../context";
import {Rect} from "../collision";
import {INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "./element";

export interface ButtonParams {
    fontsize?: number;
    horizAlign?: "left" | "center" | "right";
    vertAlign?: "top" | "center" | "bottom" | "alphabetic";
    rotation?: number;
    alpha?: number;
}

export class Button implements InteractiveElement {
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

    private _clicked: boolean = false;

    constructor(text: string, x: number, y: number, {fontsize = 12, horizAlign = "left", vertAlign = "top", rotation = 0, alpha = 0}: ButtonParams = {}) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontsize = fontsize;
        this.horizAlign = horizAlign;
        this.vertAlign = vertAlign;
        this.rotation = rotation;
        this.alpha = alpha;
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
        const rect = this.getRect(context);
        console.log(`Button '${this.text}' touched: ${rect.collidesPoint(x, y)}`)
        console.log(rect, x, y);
        return rect.collidesPoint(x, y);
    }

    get clicked(): boolean {
        return this._clicked;
    }

    getRect(c: Context): Rect {
        c.textSize(this.fontsize);
        const bounds = c.fontBounds(this.text, this.x, this.y);
        return Rect.fromMode(bounds.x, bounds.y, bounds.w, bounds.h, "corner");
    }

    draw(c: Context) {
        c.push();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        if (this.alpha < 1.0)
            c.tint(255, this.alpha * 255);

        // draw rect with rounded corners
        const rect = this.getRect(c);
        c.rectMode("center");
        c.fill(180);
        c.stroke(160);
        c.strokeWeight(0.1);
        const rectMarginY = 1.0;
        const rectMarginX = 1.8;
        c.rect(0, 0, rect.width + rectMarginX, rect.height + rectMarginY, 0.06);

        // draw text
        c.noStroke();
        c.fill(0);
        c.textSize(this.fontsize);
        c.textAlign(this.horizAlign, this.vertAlign);
        c.text(this.text, 0, 0);
        c.pop();

        // test draw
        c.rectMode("center");
        c.rect(rect.x, rect.y, rect.width, rect.height);
    }
}