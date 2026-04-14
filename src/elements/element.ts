import {Context} from "../context";

export const INTERACTIVE_ELEMENT_MARKER = "interactiveElement";

/**
 * Defines an element that can be drawn and updated.
 */
export interface InteractiveElement {
    _interactiveElementMarker: "interactiveElement";

    /**
     * Indicates whether the element is visible.
     * Neither the draw()-method nor the update()-method will be called, if the element is not visible.
     */
    visible: boolean;

    /**
     * Updates the element, for example by handling events.
     * @param context The context containing events.
     */
    update(context: Context): void;

    /**
     * Renders visual elements onto the provided rendering context.
     *
     * @param context - The rendering context where graphics will be drawn.
     */
    draw(context: Context): void;

    /**
     * Creates a JSON-serializable representation of the element.
     * The result only contains properties, that are important to reproduce the object.
     * It doesn't include volatile properties.
     *
     * @returns An object containing the element's properties.'
     */
    dump(): any;

    /**
     * Loads properties from a JSON-serializable object. The data object can be created using the dump() method.
     */
    load(data: any): void;
}