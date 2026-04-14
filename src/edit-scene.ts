import {Scene} from "./scene";
import {Context} from "./context";
import {InteractiveElement} from "./elements/element";
import {Label} from "./elements/label";
import {Sprite} from "./elements/sprite";

export class EditScene extends Scene {
    interactiveElements: InteractiveElement[] = [];
    selectedElement: InteractiveElement | null = null;

    mode: "normal" | "edit" = "normal";

    update(c: Context): void {
        if (this.mode === "normal") {
            if (c.keyJustPressed("l")) {
                this.interactiveElements.push(new Label("Hello...", 0, 0, {fontsize: 1}));
            } else if (c.keyJustPressed("s")) {
                this.interactiveElements.push(new Sprite("edit.png", 0, 0));
            } else if (c.keyJustPressed("c")) {
                this.dumpCopy(c);
            }
        }

        this.handleSelectedElement(c);

        this.handleMode(c);

        c.background(230);

        if (this.interactiveElements.length === 0) {
            new Label("No elements", 0, 0, {vertAlign: "center", horizAlign: "center", fontsize: 2}).draw(c);
        } else {
            for (const elem of this.interactiveElements) {
                elem.update(c);
                elem.draw(c);
            }
        }
    }

    dumpCopy(c: Context) {
        if (c.keyIsDown(c.SHIFT)) {
            const data: any[] = this.dump();
            copyToClipboard(JSON.stringify(data)).then(() => console.log('Copied to clipboard')).catch((reason: any) => console.error('Failed to copy', reason));
        } else {

        }
    }

    dump(): any[] {
        return this.interactiveElements.map(elem => elem.dump());
    }

    handleSelectedElement(c: Context) {
        // handle clicks
        this.selectElement(c);

        if (this.selectedElement === null) {
            return;
        }

        if (this.mode === "normal") {
            if (c.keyJustPressed("d")) {
                this.interactiveElements = this.interactiveElements.filter(elem => elem !== this.selectedElement);
                this.selectedElement = null;
            }
            if (this.selectedElement instanceof Label || this.selectedElement instanceof Sprite) {
                this.handleElementMovement(this.selectedElement, c);
            }
        } else {
            if (c.keyJustPressed("Escape")) {
                this.mode = "normal";
                return;
            }

            if (this.selectedElement instanceof Label) {
                for (const evt of c.events) {
                    if (evt.kind === 'keytyped') {
                        this.selectedElement.text += evt.key;
                    } else if (evt.kind === 'keydown') {
                        if (evt.key === "Backspace") {
                            this.selectedElement.text = this.selectedElement.text.slice(0, -1);
                        } else if (evt.key === "Delete") {
                            this.selectedElement.text = '';
                        }
                    }
                }
            }
        }
    }

    private selectElement(c: Context) {
        for (const evt of c.events) {
            if (evt.kind === 'mousedown') {
                this.selectedElement = null;
                for (const elem of this.interactiveElements) {
                    if (elem instanceof Label || elem instanceof Sprite) {
                        if (elem.touches(c)) {
                            this.selectedElement = elem;
                        }
                    }
                }
            }
        }
    }

    handleElementMovement(element: Label | Sprite, c: Context) {
        let distance = 0.1;
        if (c.keyIsDown(c.SHIFT)) {
            distance = 1;
        }
        if (c.keyJustPressed(c.LEFT_ARROW)) {
            element.x -= distance;
        } else if (c.keyJustPressed(c.RIGHT_ARROW)) {
            element.x += distance;
        } else if (c.keyJustPressed(c.UP_ARROW)) {
            element.y += distance;
        } else if (c.keyJustPressed(c.DOWN_ARROW)) {
            element.y -= distance;
        }
    }

    private handleMode(c: Context) {
        if (this.selectedElement === null) {
            this.mode = "normal";
            return;
        }

        if (this.mode === "normal") {
            if (c.keyJustPressed("e")) {
                this.mode = "edit";
                return;
            }
        } else {
            if (c.keyJustPressed("Escape")) {
                this.mode = "normal";
            }
        }

    }
}

async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}
