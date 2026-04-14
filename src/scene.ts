import {Context} from "./context";
import {INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "./elements/element";

export abstract class Scene {
    protected autoDrawMembers: InteractiveElement[] | null = null;

    /**
     * Initializes the application with the specified time, render context, and audio engine.
     *
     * @param _context - The context containing rendering helpers and audio playback.
     */
    init(_context: Context): void {}

    collectAutoDrawMembers(): InteractiveElement[] {
        const autoDrawMembers: InteractiveElement[] = [];
        Object.keys(this).forEach(memberName => {
            const member = (this as any)[memberName];
            if (member && member._interactiveElementMarker === INTERACTIVE_ELEMENT_MARKER) {
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

    autoDrawDraw(context: Context) {
        for (const member of this.autoDrawMembers!)
            if (member.visible)
                member.draw(context);
    }

    call(context: Context) {
        this.autoDrawHandleEvents(context);
        this.update(context);
        this.autoDrawDraw(context);
    }

    /**
     * Creates a Render object that shows the current state at the given time.
     * @param context The context used for timing, rendering, audio playback, events, and scene changes.
     */
    abstract update(context: Context): void;

    /**
     * Returns the duration of the scene in seconds. If the duration is not defined or can vary, return -1.
     */
    duration(): number {
        return -1;
    }
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