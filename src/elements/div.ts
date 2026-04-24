import {InteractiveElement, InteractiveElementDump} from "./interactive-element";
import {Rect} from "../element-helpers/rect";
import {Context} from "../context";
import p5 from "p5";

export class Div extends InteractiveElement {
    width: number;
    height: number;
    innerHtml: string;

    div: p5.Element | null;

    constructor(identifier: string, x: number, y: number, width: number, height: number, innerHtml: string = "") {
        super(identifier, x, y);
        this.width = width;
        this.height = height;
        this.div = null;
        this.innerHtml = innerHtml;
    }

    init(c: Context) {
        if (this.div === null) {
            this.div = c.p.createDiv(this.innerHtml);
            this.div.position(this.x, this.y, "absolute");
            this.div.size(this.width, this.height);
            this.div.style("z-index", "1");
        }
        c.canvasContainer.child(this.div);
    }

    drop(c: Context) {
        if (this.div !== null)
            this.div.remove();
    }

    draw(): void {}

    getBoundingBox(): Rect {
        return Rect.fromMode(this.x, this.y, this.width, this.height, "corners");
    }

    dump(): InteractiveElementDump {
        throw new Error("Method not implemented.");
    }

    getSourceCode(): string {
        throw new Error("Method not implemented.");
    }

    load(data: InteractiveElementDump): void {
        throw new Error("Method not implemented.");
    }
}