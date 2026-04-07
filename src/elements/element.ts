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
}