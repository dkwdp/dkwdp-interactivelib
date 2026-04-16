import {Scene} from "../scene";
import {InteractiveElement} from "../elements/interactive-element";
import {Context} from "../context";

export abstract class AutoDrawScene extends Scene {
    protected autoDrawMembers: InteractiveElement[] | null = null;

    backgroundColor: number;

    protected constructor(backgroundColor: number = 235) {
        super();
        this.backgroundColor = backgroundColor;
    }

    init(context: Context) {
        if (this.autoDrawMembers === null)
            this.autoDrawMembers = this.collectAutoDrawMembers();
        this.autoDrawMembers.forEach((elem) => elem.init(context));
    }

    collectAutoDrawMembers(): InteractiveElement[] {
        const autoDrawMembers: InteractiveElement[] = [];
        Object.keys(this).forEach(memberName => {
            const member = (this as any)[memberName];
            if (member && member._interactiveElementMarker === "interactiveElement") {
                const ignoredElements = (this.constructor as any).ignoredElements || new Set<string>();
                if (!ignoredElements.has(memberName)) {
                    autoDrawMembers.push(member);
                }
            }
        })
        return autoDrawMembers;
    }

    autoDrawHandleEvents(context: Context) {
        if (this.autoDrawMembers === null)
            this.autoDrawMembers = this.collectAutoDrawMembers();
        for (const member of this.autoDrawMembers)
            if (member.visible)
                member.update(context);
    }

    autoDrawDraw() {
        for (const member of this.autoDrawMembers!)
            if (member.visible)
                member.draw();
    }

    call(context: Context) {
        this.autoDrawHandleEvents(context);
        this.update(context);
        context.background(this.backgroundColor);
        this.autoDrawDraw();
    }

    update(_c: Context): void {}
}

/**
 * Decorator to collect elements that should be ignored for automatic drawing.
 * @param sceneClass The class that contains the elements to be ignored.
 * @param elementKey The key of the element in the class.
 * @constructor
 */
export function Ignore(sceneClass: any, elementKey: string) {
    if (!sceneClass.constructor.ignoredElements) {
        sceneClass.constructor.ignoredElements = new Set<string>();
    }
    // Add the property name to the list
    sceneClass.constructor.ignoredElements.add(elementKey);
}