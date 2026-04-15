import {Scene} from "./scene";
import {Context} from "./context";
import {InteractiveElement} from "./elements/interactive-element";
import {Label} from "./elements/label";
import {Sprite} from "./elements/sprite";

export class EditScene extends Scene {
    interactiveElements: InteractiveElement[] = [];
    selectedElements: InteractiveElement[] = [];

    mode: "normal" | "edit" = "normal";

    update(c: Context): void {
        this.addElements(c);

        for (const elem of this.interactiveElements) elem.update(c);

        this.handleSelectedElement(c);

        this.handleMode(c);

        this.draw(c);
    }

    private draw(c: Context) {
        c.background(230);

        if (this.interactiveElements.length === 0) {
            const label = new Label("", "No elements", 0, 0, {vertAlign: "center", horizAlign: "center", fontsize: 2});
            label.update(c);
            label.draw();
        }
        for (const elem of this.interactiveElements)
            elem.draw();

        // draw interactive element
        for (const selectedElement of this.selectedElements) {
            const rect = selectedElement.getBoundingBox();
            c.push()
            c.rectMode("center");
            c.noFill();
            c.strokeWeight(0.1);
            c.stroke(101, 179, 225);
            c.rect(rect.x, rect.y, rect.width, rect.height);
            c.pop();
        }
    }

    private addElements(c: Context) {
        if (this.mode === "normal") {
            if (c.keyJustPressed("l")) {
                this.interactiveElements.push(new Label(this.getNextElementName("Label"), "Hello...", 0, 0, {fontsize: 1}));
            } else if (c.keyJustPressed("s")) {
                this.interactiveElements.push(new Sprite(this.getNextElementName("Sprite"), "edit.png", 0, 0));
            } else if (c.keyJustPressed("KeyC")) {
                this.dumpCopy(c);
            }
        }
    }

    dumpCopy(c: Context) {
        if (c.keyIsDown(c.SHIFT)) {
            const sourceCode = this.dumpSourceCode();
            copyToClipboard(sourceCode).then(() => console.log('Copied source to clipboard')).catch((reason: any) => console.error('Failed to copy', reason));
        } else {
            const data: any[] = this.dump();
            copyToClipboard(JSON.stringify(data)).then(() => console.log('Copied json to clipboard')).catch((reason: any) => console.error('Failed to copy', reason));
        }
    }

    dump(): any[] {
        return this.interactiveElements.map(elem => elem.dump());
    }

    dumpSourceCode(): string {
        return this.interactiveElements.map(elem => elem.getSourceCode()).join('\n');
    }

    handleSelectedElement(c: Context) {
        // handle clicks
        this.updateSelection(c);

        // handle remove
        if (this.mode === "normal" && c.keyJustPressed("d")) {
            this.interactiveElements = this.interactiveElements.filter(elem => !this.selectedElements.includes(elem));
            this.selectedElements = [];
        }

        for (const selectedElement of this.selectedElements)
            selectedElement.handleEdit(c, this.mode);
    }

    private updateSelection(c: Context) {
        for (const evt of c.events) {
            if (evt.kind === 'mousedown') {
                this.selectedElements = this.interactiveElements.filter((elem) => elem.touches());
                break;
            }
        }
    }

    private handleMode(c: Context) {
        if (this.selectedElements.length === 0) {
            this.mode = "normal";
            return;
        }

        if (this.mode === "normal") {
            if (c.keyJustPressed("i")) {
                this.mode = "edit";
                return;
            }
        } else {
            if (c.keyJustPressed("Escape")) {
                this.mode = "normal";
            }
        }
    }

    private getNextElementName(kind: string): string {
        const used = new Set(this.interactiveElements.map(e => e.identifier));
        let i = 1;
        while (true) {
            const name = `${kind}${String(i).padStart(2, '0')}`;
            if (!used.has(name)) return name;
            i++;
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
