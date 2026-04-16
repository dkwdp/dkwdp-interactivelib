import {InteractiveElement, InteractiveElementDump} from "./interactive-element";
import {Rect} from "../element-helpers/rect";
import {Context} from "../context";
import {Sprite} from "./sprite";

export class HoverEffect extends InteractiveElement {
    parent: Sprite;
    private wasHovered: boolean = false;
    private readonly scale: number;

    constructor(parent: Sprite, scale: number = 1.02) {
        super(parent.identifier + "_hover", parent.x, parent.y);
        this.parent = parent;
        this.scale = scale;
    }

    update(_c: Context): void {
        const nowHovered = this.parent.touches();
        if (nowHovered && !this.wasHovered) {
            this.parent.changeSize(this.scale);
        } else if (!nowHovered && this.wasHovered) {
            this.parent.changeSize(1 / this.scale);
        }
        this.wasHovered = nowHovered;
    }

    draw(): void {}

    dump(): InteractiveElementDump {
        throw new Error("Method not implemented.");
    }

    getBoundingBox(): Rect {
        return this.parent.getBoundingBox();
    }

    getSourceCode(): string {
        throw new Error("Method not implemented.");
    }

    load(_data: InteractiveElementDump): void {
        throw new Error("Method not implemented.");
    }
}