import {InteractiveElement, InteractiveElementDump} from "./interactive-element";
import {Label} from "./label";
import {HorizAlign, VertAlign} from "../element-helpers/text-tools";
import {Rect} from "../element-helpers/rect";

export interface MultiLabelParams {
    fontsize?: number;
    horizAlign?: HorizAlign;
    vertAlign?: VertAlign;
    rotation?: number;
    alpha?: number;
    color?: [number, number, number];
    spacing?: number;
}

export class MultiLabel extends InteractiveElement {
    private readonly labels: Label[];
    private _boundingBox: Rect | null = null;

    constructor(identifier: string, texts: string[], x: number, y: number, {fontsize = 3, horizAlign = "left", vertAlign = "top", rotation = 0, alpha = 0, color = [0, 0, 0], spacing = -1}: MultiLabelParams = {}) {
        super(identifier, x, y);
        if (spacing <= 0)
            spacing = fontsize * 1.1;
        this.labels = texts.map(((text, index) => new Label(identifier + "_" + index, text, x, y + spacing * index, {fontsize, horizAlign, vertAlign, rotation, alpha, color})));
    }

    draw(): void {
        this.labels.forEach(label => label.draw());
    }

    dump(): InteractiveElementDump {
        throw new Error("Method not implemented.");
    }

    getBoundingBox(): Rect {
        if (this._boundingBox === null) {
            const top = this.labels[0].getBoundingBox().maxY;
            const bottom = this.labels[this.labels.length - 1].getBoundingBox().minY;
            let minX = Infinity;
            let maxX = -Infinity;
            for (const label of this.labels) {
                const rect = label.getBoundingBox();
                minX = Math.min(minX, rect.minX);
                maxX = Math.max(maxX, rect.maxX);
            }
            this._boundingBox = Rect.fromMode(minX, top, maxX - minX, bottom - top, "corners");
        }
        return this._boundingBox;
    }

    getSourceCode(): string {
        throw new Error("Method not implemented.");
    }

    load(data: InteractiveElementDump): void {
        throw new Error("Method not implemented.");
    }
}