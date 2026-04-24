import {Scene} from "../scene";
import {
    collectInteractiveElements,
    collectUpdatables,
    InteractiveElement,
    Updatable
} from "../elements/interactive-element";
import {Context} from "../context";

export class AutoDrawScene extends Scene {
    protected autoUpdatables: Updatable[] | null = null;
    protected autoInteractiveElements: InteractiveElement[] | null = null;

    backgroundColor: number;

    constructor(backgroundColor: number = 235) {
        super();
        this.backgroundColor = backgroundColor;
    }

    init(context: Context) {
        this.initializeAutoElements();
        this.autoUpdatables!.forEach((elem) => elem.init(context));
    }

    drop(c: Context): void {
        this.autoUpdatables!.forEach((elem) => elem.drop(c))
    }

    autoDrawUpdate(context: Context) {
        this.initializeAutoElements();
        for (const member of this.autoUpdatables!)
            member.update(context);
    }

    private initializeAutoElements() {
        if (this.autoInteractiveElements === null)
            this.autoInteractiveElements = collectInteractiveElements(this);
        if (this.autoUpdatables === null)
            this.autoUpdatables = collectUpdatables(this);
    }

    autoDrawDraw() {
        for (const member of this.autoInteractiveElements!)
            if (member.visible)
                member.draw();
    }

    call(context: Context) {
        this.autoDrawUpdate(context);
        context.background(this.backgroundColor);
        this.update(context);
        this.autoDrawDraw();
    }

    update(_c: Context): void {}
}