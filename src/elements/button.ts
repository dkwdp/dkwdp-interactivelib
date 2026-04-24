import { Context } from "../context";
import { InteractiveElement, InteractiveElementDump } from "./interactive-element";
import { Rect } from "../element-helpers/rect";
import { TextTools, HorizAlign, VertAlign } from "../element-helpers/text-tools";

export interface ButtonParams {
    width?: number;
    height?: number;
    label?: string;
    color?: [number, number, number];
    fontsize?: number;
    fontcolor?: [number, number, number];
}

export class Button extends InteractiveElement {
    width: number;
    height: number;
    label: string;
    color: [number, number, number];
    fontsize: number;
    fontcolor: [number, number, number];

    constructor(identifier: string, x: number, y: number, { width = 10, height = 5, label = "Click Me!", color = [200, 200, 200], fontsize = 3, fontcolor = [0, 0, 0] }: ButtonParams = {}) {
        super(identifier, x, y);
        this.width = width;
        this.height = height;
        this.label = label;
        this.color = color;
        this.fontsize = fontsize;
        this.fontcolor = fontcolor;
    }

    getBoundingBox(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    draw(): void {
        const c = this.getContext();
        c.push();
        if (this.hovered) {
            c.fill(this.color[0] + 40, this.color[1] + 40, this.color[2] + 40);
        } else {
            c.fill(this.color[0], this.color[1], this.color[2]);
        }
        c.rect(this.x, this.y, this.width, this.height);
        c.fill(255);
        c.textAlign("center", "center");
        c.text(this.label, this.x + this.width / 2, this.y + this.height / 2);
        c.pop();
    }
    dump(): InteractiveElementDump {
        return {
            kind: "button",
            identifier: this._identifier,
            x: this.x, 
            y: this.y,
            width: this.width, 
            height: this.height,
            label: this.label, 
            color: this.color,
            fontsize: this.fontsize,
            fontcolor: this.fontcolor
        };
    }

    getSourceCode(): string {
        return `${this.getSourceCodeIdentifier()}: Button = new Button("${this._identifier}", ${this.x.toFixed(1)}, ${this.y.toFixed(1)}, {width: ${this.width}, height: ${this.height}, label: "${this.label}"}, {fontsize: ${this.fontsize}, fontcolor: [${this.fontcolor.join(', ')}]});`;
    }

    load(data: any): void {
        this.x = data.x; this.y = data.y;
        this.width = data.width; 
        this.height = data.height;
        this.label = data.label; 
        this.color = data.color;
        this.fontsize = data.fontsize; 
        this.fontcolor = data.fontcolor;
    }

    static fromDump(d: InteractiveElementDump): Button {
        const b = new Button(d.identifier, d.x, d.y);
        b.load(d);
        return b;
    }
}