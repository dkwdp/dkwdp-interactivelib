import {Context, ContextNotProvidedError} from "../context";
import {Rect} from "../element-helpers/rect";

export abstract class Updatable {
    public readonly _updatableMarker: "updatable" = "updatable";

    /**
     * An unique identifier for the element.
     */
    protected _identifier: string;

    /**
     * A context object used to provide information about the drawing environment and other resources.
     */
    protected _context: Context | null = null;

    protected constructor(identifier: string) {
        this._identifier = identifier;
    }

    /**
     * Initializes the module with the provided context.
     *
     * @param _context - The context object used for initialization.
     */
    init(_context: Context): void {}

    get identifier(): string {
        return this._identifier;
    }

    /**
     * Updates the element based on the provided context.
     * @param c - The context object containing drawing environment and resources.
     */
    update(c: Context): void {
        this._context = c;
    }

    /**
     * Safely gets the context.
     */
    protected getContext(): Context {
        if (this._context === null)
            throw new ContextNotProvidedError(`Failed to get context. ${this.constructor.name} ${this._identifier}`);
        return this._context;
    }

    /**
     * Creates a JSON-serializable representation of the element.
     * The result only contains properties, that are important to reproduce the object.
     * It doesn't include volatile properties.
     *
     * @returns An object containing the element's properties.
     */
    abstract dump(): InteractiveElementDump;

    /**
     * Returns the source code that would create this element.
     */
    abstract getSourceCode(): string;

    /**
     * Formats the identifier into a camelCase string.
     */
    getSourceCodeIdentifier(): string {
        // Matches alphanumeric sequences, effectively ignoring all whitespace and symbols
        const words = this._identifier.match(/[a-z0-9]+/gi) || [];

        return words
            .map((word, index) => {
                const lower = word.toLowerCase();
                return index === 0
                    ? lower
                    : lower.charAt(0).toUpperCase() + lower.slice(1);
            })
            .join('');
    }

    /**
     * Loads properties from a JSON-serializable object. The data object can be created using the dump() method.
     */
    abstract load(data: InteractiveElementDump): void;
}

/**
 * Defines an element that can be drawn and updated.
 */
export abstract class InteractiveElement extends Updatable {
    public readonly _interactiveElementMarker: "interactiveElement" = "interactiveElement";

    /**
     * Indicates whether the element is visible.
     * Neither the draw()-method nor the update()-method will be called, if the element is not visible.
     */
    public visible: boolean;

    /**
     * The horizontal-coordinate of the element.
     */
    x: number;

    /**
     * The vertical-coordinate of the element.
     */
    y: number;

    private _clicked: boolean = false;
    private _hovered: boolean = false;

    /**
     * Constructs a new instance of the class with specified x and y coordinates.
     *
     * @param identifier - The unique identifier for the element.
     * @param x - The x-coordinate value.
     * @param y - The y-coordinate value.
     * @return A new instance of the class.
     */
    protected constructor(identifier: string, x: number, y: number) {
        super(identifier);
        this.x = x;
        this.y = y;
        this.visible = true;
    }

    /**
     * Indicates whether the element has been clicked.
     */
    get clicked(): boolean {
        return this._clicked;
    }

    /**
     * Indicates whether the element is currently hovered.
     */
    get hovered(): boolean {
        return this._hovered;
    }

    /**
     * A rect, that contains the element completely.
     */
    abstract getBoundingBox(): Rect;

    /**
     * Determines if the specified coordinates (x, y) are touching this interactive element.
     *
     * @param [x] The optional x-coordinate to check. If not provided, the current mouse x-position is used.
     * @param [y] The optional y-coordinate to check. If not provided, the current mouse y-position is used.
     * @return Returns true if the coordinates are touch the given position; otherwise, returns false.
     */
    touches(x?: number, y?: number): boolean {
        const c = this.getContext();

        if (x === undefined) x = c.mousePos.x;
        if (y === undefined) y = c.mousePos.y;

        return this.getBoundingBox().collidesPoint(x, y);
    }

    /**
     * Updates the element, for example by handling events.
     * @param context The context containing events.
     */
    update(context: Context): void {
        super.update(context);
        this._hovered = this.touches(context.mousePos.x, context.mousePos.y);
        this._clicked = false;
        if (this._hovered) {
            for (const evt of context.events) {
                if (evt.kind === "mousedown") {
                    this._clicked = true;
                    break;
                }
            }
        }
    }

    /**
     * Handles events in edit mode.
     * @param c The context containing events and other relevant information.
     * @param mode The mode of the edit-scene. Either "normal", to implement movement, or "edit", to implement editing.
     */
    handleEdit(c: Context, mode: "normal" | "edit") {
        if (mode === "normal") {
            let distance = 0.1;
            if (c.keyIsDown(c.SHIFT)) {
                distance = 1;
            }
            if (c.keyJustPressed(c.LEFT_ARROW)) {
                this.x -= distance;
            } else if (c.keyJustPressed(c.RIGHT_ARROW)) {
                this.x += distance;
            } else if (c.keyJustPressed(c.UP_ARROW)) {
                this.y += distance;
            } else if (c.keyJustPressed(c.DOWN_ARROW)) {
                this.y -= distance;
            }

            const mouseMovement = c.mouseMovement();
            if (mouseMovement.dragging) {
                this.x += mouseMovement.x;
                this.y += mouseMovement.y;
            }
        }
    }

    /**
     * Renders visual elements onto the provided rendering context.
     */
    abstract draw(): void;
}

export interface InteractiveElementDump {
    kind: string;
    identifier: string;
    [key: string]: any;
}

export function collectUpdatables(obj: any): Updatable[] {
    const elements: Updatable[] = [];
    const ignoredElements = (obj.constructor as any).ignoredElements || new Set<string>();
    Object.keys(obj).forEach(memberName => {
        const member = obj[memberName];
        if (member && member._updatableMarker === "updatable") {
            if (!ignoredElements.has(memberName)) {
                elements.push(member);
            }
        }
    });
    return elements;
}

export function collectInteractiveElements(obj: any): InteractiveElement[] {
    const elements: InteractiveElement[] = [];
    const ignoredElements = (obj.constructor as any).ignoredElements || new Set<string>();
    Object.keys(obj).forEach(memberName => {
        const member = obj[memberName];
        if (member && member._interactiveElementMarker === "interactiveElement") {
            if (!ignoredElements.has(memberName)) {
                elements.push(member);
            }
        }
    });
    return elements;
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
