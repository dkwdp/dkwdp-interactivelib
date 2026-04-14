import {Context} from "../context";
import {INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "./element";
import {Rect} from "../element-helpers/rect";
import {TextTools, HorizAlign, VertAlign} from "../element-helpers/text-tools";

export interface LabelParams {
    fontsize?: number;
    horizAlign?: HorizAlign;
    vertAlign?: VertAlign;
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
    horizAlign: HorizAlign = "left";

    /**
     * Image rendering mode. Default is "top".
     * top: draws the label top aligned
     * center: draws the label center aligned
     * bottom: draws the label bottom aligned
     * alphabetic: draws the label alphabetic aligned
     */
    vertAlign: VertAlign = "top";

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

    constructor(text: string, x: number, y: number, {fontsize = 3, horizAlign = "left", vertAlign = "top", rotation = 0, alpha = 0, color = [0, 0, 0]}: LabelParams = {}) {
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
        return TextTools.getRect(c, this.text, this.x, this.y, this.fontsize, this.horizAlign, this.vertAlign);
    }

    update(c: Context) {
        this._clicked = false;
        this._hovered = this.touches(c);
        if (this._hovered) {
            for (const evt of c.events) {
                if (evt.kind === "mousedown") {
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

    dump(): any {
        return {
            visible: this.visible,
            text: this.text,
            x: this.x,
            y: this.y,
            fontsize: this.fontsize,
            horizAlign: this.horizAlign,
            vertAlign: this.vertAlign,
            color: this.color,
            rotation: this.rotation,
            alpha: this.alpha,
        }
    }

    load(data: any): void {
        this.visible = data.visible;
        this.text = data.text;
        this.x = data.x;
        this.y = data.y;
        this.fontsize = data.fontsize;
        this.horizAlign = data.horizAlign;
        this.vertAlign = data.vertAlign;
        this.color = data.color;
        this.rotation = data.rotation;
        this.alpha = data.alpha;
    }
}