import p5 from "p5";
import {Audio, AudioBuf, AudioPlayer, SpriteBuffer} from "./media";
import {Evt} from "./event";
import {CoordinateSystem} from "./coordinates";

export class Context {
    readonly time: number;
    readonly globalTime: number;
    readonly p: p5;
    readonly spriteBuffer: SpriteBuffer;
    readonly events: Evt[];
    readonly coordinates: CoordinateSystem;

    // noinspection JSMismatchedCollectionQueryUpdate
    private readonly audioPlayers: AudioPlayer[];
    private readonly audioBuffer: AudioBuf;
    private readonly _audios: Audio[];

    nextScene: string | null;

    readonly CORNER: "corner" = "corner";
    readonly CENTER: "center" = "center";
    readonly CORNERS: "corners" = "corners";
    readonly RADIUS: "radius" = "radius";
    readonly LEFT: "left" = "left";
    readonly RIGHT: "right" = "right";
    readonly TOP: "top" = "top";
    readonly BOTTOM: "bottom" = "bottom";
    readonly CLOSE: "close" = "close";

    readonly SHIFT: string = "Shift";
    readonly LEFT_ARROW: string = "ArrowLeft";
    readonly RIGHT_ARROW: string = "ArrowRight";
    readonly DOWN_ARROW: string = "ArrowDown";
    readonly UP_ARROW: string = "ArrowUp";

    constructor(time: number, globalTime: number, p: p5, spriteBuffer: SpriteBuffer, audioPlayers: AudioPlayer[], audioBuffer: AudioBuf, events: Evt[], coordinates: CoordinateSystem) {
        this.time = time;
        this.globalTime = globalTime;
        this.p = p;
        this.spriteBuffer = spriteBuffer;
        this.audioPlayers = audioPlayers;
        this.audioBuffer = audioBuffer;
        this.events = events;
        this.coordinates = coordinates;
        this._audios = [];
        this.nextScene = null;
    }

    /**
     * Plays an audio file at the given offset.
     * @param filename The filename of the audio file to play.
     * @param offset The offset in seconds how much audio should be skipped at the start of the audiofile.
     * @param controlled If false, the audio will be played and will continue to play until the end of the audiofile.
     * If true, the audio will be played only one frame, and only continued, if playAudio() is called again with the same filename and the offset + delta time.
     */
    playAudio(filename: string, offset: number = 0, controlled: boolean = false) {
        if (!controlled) {
            const source = this.audioBuffer.get(filename);
            if (!source) throw new Error(`Audio file not found: ${filename}`);
            const player = source.createPlayer();
            player.play(offset, this.globalTime);
            this.audioPlayers.push(player);
        } else {
            this._audios.push(new Audio(filename, offset));
        }
    }

    get audios(): Audio[] {
        return this._audios;
    }

    /**
     * Sets the background color using the specified red, green, blue, and alpha values.
     * If green and blue values are not provided, they default to the value of the red parameter.
     *
     * @param r - The red component of the color (0-255).
     * @param [g=null] - The green component of the color (0-255). Defaults to the value of `r` if not provided.
     * @param [b=null] - The blue component of the color (0-255). Defaults to the value of `r` if not provided.
     * @param [a=255] - The alpha (opacity) component of the color (0-255). Defaults to 255 if not provided.
     * @return Does not return a value.
     */
    background(r: number, g: number | null = null, b: number | null = null, a: number = 255) {
        if (g === null) g = r;
        if (b === null) b = r;
        this.p.background(r, g, b, a);
    }

    /**
     * Draws text at the given position.
     * @param text The text to draw.
     * @param x The x position of the text.
     * @param y The y position of the text.
     */
    text(text: string, x: number, y: number) {
        this.p.text(text, x, -y);
    }

    /**
     * Computes a generic (non-tight) bounding box for a block of text.
     * The fontBounds() function calculates the bounding box for the text based on the font's intrinsic metrics
     * (such as fontBoundingBoxAscent and fontBoundingBoxDescent).
     * Unlike textBounds(), which measures the exact pixel boundaries of the rendered text, fontBounds() provides a
     * looser measurement derived from the font’s default spacing.
     * This measurement is useful for layout purposes where a consistent approximation of the text's dimensions is
     * desired.
     * @param text The text to measure.
     * @param x The x position of the text.
     * @param y The y position of the text.
     * @param w The width of the text box.
     * @param h The height of the text box.
     */
    fontBounds(text: string, x: number, y: number, w?: number, h?: number): {x: number, y: number, w: number, h: number} {
        return this.p.fontBounds(text, x, y, w, h);
    }

    fontWidth(text: string): number {
        return this.p.fontWidth(text);
    }

    textWidth(text: string): number {
        return this.p.textWidth(text);
    }

    textBounds(text: string, x: number, y: number, width?: number, height?: number): {x: number, y: number, w: number, h: number} {
        return this.p.textBounds(text, x, y, width, height);
    }

    cursor(type: string | "arrow" | "cross" | "hand" | "move" | "text", x?: number, y?: number) {
        this.p.cursor(type, x, y);
    }

    /**
     * Returns the mouse position in dkwdp-coordinates.
     */
    get mousePos(): p5.Vector {
        const [x, y] = this.coordinates.s2w(this.p.mouseX, this.p.mouseY);
        return this.p.createVector(x, -y);
    }

    /**
     * Extracts the alpha (transparency) value from a p5.Color object, array of color components, or CSS color string.
     * @param color p5.Color object, array of color components, or CSS color string.
     */
    alpha(color: p5.Color | number[] | string): number {
        return this.p.alpha(color);
    }

    /**
     * The push() function saves the current drawing style settings and transformations, while pop() restores these settings.
     */
    push() {
        this.p.push();
    }

    /**
     * The pop() function restores the most recently saved drawing style settings and transformations.
     */
    pop() {
        this.p.pop();
    }

    /**
     * Sets the fill value for displaying images. Images can be tinted to specified colors or made transparent by including an alpha value.
     * To apply transparency to an image without affecting its color, use white as the tint color and specify an alpha value.
     * For instance, tint(255, 128) will make an image 50% transparent (assuming the default alpha range of 0-255, which can be changed with colorMode()).
     * The value for the gray parameter must be less than or equal to the current maximum value as specified by colorMode(). The default maximum value is 255.
     * @param gray The gray value used to tint the image. Values range from 0 (black) to 255 (white).
     * @param alpha The alpha value used to tint the image. Values range from 0 (fully transparent) to 255 (fully opaque).
     */
    tint(gray: number, alpha: number = 255) {
        this.p.tint(gray, alpha);
    }

    translate(x: number, y: number) {
        this.p.translate(x, -y);
    }

    rotate(angle: number) {
        this.p.rotate(angle);
    }

    imageMode(mode: "corner" | "center" | "corners") {
        this.p.imageMode(mode);
    }

    image(image: p5.Image, x: number, y: number, w: number, h: number) {
        this.p.image(image, x, -y, w, h);
    }

    createVector(x: number, y: number): p5.Vector {
        return this.p.createVector(x, y);
    }

    textAlign(horizAlign: "left" | "center" | "right", vertAlign: "top" | "center" | "bottom" | "alphabetic") {
        this.p.textAlign(horizAlign, vertAlign);
    }

    textSize(size: number) {
        this.p.textSize(size);
    }

    textAscent(txt?: string): number {
        return this.p.textAscent(txt);
    }

    textDescent(txt?: string): number {
        return this.p.textDescent(txt);
    }

    noStroke() {
        this.p.noStroke();
    }

    fill(r: number, g: number | null = null, b: number | null = null, a: number = 255) {
        if (g === null) g = r;
        if (b === null) b = r;
        this.p.fill(r, g, b, a);
    }

    rect(x: number, y: number, w: number, h: number, tl?: number, tr?: number, br?: number, bl?: number) {
        this.p.rect(x, -y, w, h, tl, tr, br, bl);
    }

    circle(x: number, y: number, r: number) {
        this.p.circle(x, -y, r);
    }

    noFill() {
        this.p.noFill();
    }

    stroke(color: number, g: number | null = null, b: number | null = null, a: number = 255) {
        if (g === null) g = color;
        if (b === null) b = color;
        this.p.stroke(color, g, b, a);
    }

    strokeWeight(weight: number) {
        this.p.strokeWeight(weight);
    }

    rectMode(mode: "corner" | "center" | "corners" | "radius") {
        this.p.rectMode(mode);
    }

    beginShape(beginKind?: 0 | 1 | 4 | 6 | 5 | "quads" | "quad_strip" | 8) {
        this.p.beginShape(beginKind);
    }

    endShape(endKind?: "close", count?: number) {
        this.p.endShape(endKind, count);
    }

    vertex(x: number, y: number) {
        this.p.vertex(x, -y);
    }

    keyJustPressed(key: string | number): boolean {
        for (const evt of this.events) {
            if (evt.kind === "keydown") {
                if (evt.key === key || evt.keyCode === key || evt.code === key) {
                    return true;
                }
            }
        }
        return false;
    }

    keyJustTyped(key: string | number): boolean {
        for (const evt of this.events) {
            if (evt.kind === "keytyped") {
                if (evt.key === key || evt.keyCode === key || evt.code === key) {
                    return true;
                }
            }
        }
        return false;
    }

    keyIsDown(key: string): boolean {
        return this.p.keyIsDown(key);
    }
}
