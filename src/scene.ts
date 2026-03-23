import {Context} from "./context";
import {InteractiveElement} from "./elements/element";

export abstract class Scene {
    private autoDrawMembers: InteractiveElement[] | null = null;

    /**
     * Initializes the application with the specified time, render context, and audio engine.
     *
     * @param _context - The context containing rendering helpers and audio playback.
     */
    init(_context: Context): void {}

    collectAutoDrawMembers(): InteractiveElement[] {
        const autoDrawMembers = [];
        for (const memberName of (this.constructor as any).registeredMembers || []) {
            const member = (this as any)[memberName];
            if (member && member.draw && member.update) {
                autoDrawMembers.push(member);
            } else {
                console.warn(`Member ${memberName} does not implement InteractiveElement: ${member}.`);
            }
        }
        return autoDrawMembers;
    }

    autoDrawHandleEvents(context: Context) {
        if (this.autoDrawMembers === null)
            this.autoDrawMembers = this.collectAutoDrawMembers();
        for (const member of this.autoDrawMembers)
            member.update(context);
    }

    autoDrawDraw(context: Context) {
        for (const member of this.autoDrawMembers!)
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
 * Decorator to collect elements that should be drawn automatically.
 * @param sceneClass The class that contains the elements to be drawn.
 * @param elementKey The key of the element in the class.
 * @constructor
 */
export function AutoDraw(sceneClass: any, elementKey: string) {
    if (!sceneClass.constructor.registeredMembers) {
        sceneClass.constructor.registeredMembers = [];
    }
    // Add the property name to the list
    sceneClass.constructor.registeredMembers.push(elementKey);
}