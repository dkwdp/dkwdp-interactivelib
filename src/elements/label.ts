import {Context} from "../context";
import {INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "./element";
import {Rect} from "../collision";

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

        const rect = this.getRect(c);
        return rect.collidesPoint(x, y);
    }

    getRect(c: Context): Rect {
        c.textSize(this.fontsize);
        let vertAlign = this.vertAlign;
        let y = this.y;
        if (this.vertAlign === "alphabetic") {
            vertAlign = "top";
            y = this.y + c.textAscent(this.text);
        }
        c.textAlign(this.horizAlign, vertAlign);
        const w = c.fontWidth(this.text);
        return Rect.fromTextAlign(this.x, y, w, this.fontsize, this.horizAlign, vertAlign);
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