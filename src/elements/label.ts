import {Context} from "../context";
import {InteractiveElement, InteractiveElementDump} from "./interactive-element";
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

export class Label extends InteractiveElement {
    text: string;

    fontsize: number;

    color: [number, number, number];

    /**
     * Image rendering mode. The default is "left".
     * left: draws the label left aligned
     * center: draws the label center aligned
     * radius: draws the label right aligned
     */
    horizAlign: HorizAlign = "left";

    /**
     * Image rendering mode. The default is "top".
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

    constructor(identifier: string, text: string, x: number, y: number, {fontsize = 3, horizAlign = "left", vertAlign = "top", rotation = 0, alpha = 0, color = [0, 0, 0]}: LabelParams = {}) {
        super(identifier, x, y);
        this.text = text;
        this.fontsize = fontsize;
        this.horizAlign = horizAlign;
        this.vertAlign = vertAlign;
        this.rotation = rotation;
        this.alpha = alpha;
        this.color = color;
    }

    getBoundingBox(): Rect {
        return TextTools.getRect(this._context!, this.text, this.x, this.y, this.fontsize, this.horizAlign, this.vertAlign);
    }

    update(c: Context) {
        super.update(c);
    }

    handleEdit(c: Context, mode: "normal" | "edit") {
        super.handleEdit(c, mode);

        if (mode === "normal") {
            if (c.keyJustPressed("+")) {
                this.fontsize *= 1.2;
            }
            if (c.keyJustPressed("-")) {
                this.fontsize *= 1 / 1.2;
            }
            if (c.keyJustPressed("a")) {
                this.horizAlign = this.horizAlign === "left" ? "center" : "left";
            }
        } else if (mode === "edit") {
            for (const evt of c.events) {
                if (evt.kind === 'keytyped') {
                    this.text += evt.key;
                } else if (evt.kind === 'keydown') {
                    switch (evt.key) {
                        case "Backspace":
                            this.text = this.text.slice(0, -1);
                            break;
                        case "Delete":
                            this.text = '';
                            break;
                    }
                }
            }
        }
    }

    draw() {
        const c = this.getContext();
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

    dump(): InteractiveElementDump {
        return {
            identifier: this._identifier,
            kind: "label",
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

    getSourceCode(): string {
        return `${this.getSourceCodeIdentifier()}: Label = new Label("${this.identifier}", "${this.text}", ${this.x.toFixed(2)}, ${this.y.toFixed(2)}, {fontsize: ${this.fontsize}, horizAlign: "${this.horizAlign}", vertAlign: "${this.vertAlign}", rotation: ${this.rotation}, alpha: ${this.alpha}, color: [${this.color[0]}, ${this.color[1]}, ${this.color[2]}]});`;
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

    static fromDump(d: InteractiveElementDump): Label {
        const label = new Label(d.identifier, d.text, d.x, d.y);
        label.load(d);
        return label;
    }
}