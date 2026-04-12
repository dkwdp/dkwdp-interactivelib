import {Rect} from "./rect";
import {Context} from "../context";

export type VertAlign = "top" | "center" | "bottom" | "alphabetic";
export type HorizAlign = "left" | "center" | "right";

export namespace TextTools {
    export function getRect(c: Context, text: string, x: number, y: number, fontsize: number, horizAlign: HorizAlign, vertAlign: VertAlign): Rect {
        c.textSize(fontsize);
        if (vertAlign === "alphabetic") {
            vertAlign = "top";
            y = y + c.textAscent(text);
        }
        c.textAlign(horizAlign, vertAlign);
        const w = c.fontWidth(text);
        return Rect.fromTextAlign(x, y, w, fontsize, horizAlign, vertAlign);
    }
}