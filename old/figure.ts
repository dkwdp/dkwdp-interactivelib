import p5 from 'p5';
import {FigureAction, SetVisible, SlideChangeAction, SlideToAction, WaitAction} from "./figure-actions";

export class Figure {
    x: number;
    y: number;
    image: string;
    size: number;
    visible: boolean;
    dragging: boolean;
    draggable: boolean;
    freezeX: boolean;
    freezeY: boolean;
    keyboardControl: boolean;
    actionQueue: FigureAction[];
    imageWidth: number;
    imageHeight: number;

    constructor(x: number, y: number, image: string, size: number, imageWidth: number, imageHeight: number) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.size = size;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.visible = true;
        this.dragging = false;
        this.draggable = true;
        this.freezeX = false;
        this.freezeY = false;
        this.keyboardControl = false;
        this.actionQueue = [];
    }

    draw() {
        if (!this.visible) return;
        // TODO: coordinate systems + remove draw()?
        let world_xy = worldToScreen(this.x, this.y);
        image(this.image, world_xy[0], world_xy[1], this.getWidth(), this.getHeight());
    }

    update() {
        if (this.actionQueue.length > 0) {
            const currentAction = this.actionQueue[0];
            currentAction.update(this);
            if (currentAction.isComplete) {
                this.actionQueue.shift();
            }
        }

        if (this.keyboardControl) {
            if (keyIsDown(LEFT_ARROW) && !this.freezeX)
                this.x -= 5;
            if (keyIsDown(RIGHT_ARROW) && !this.freezeX)
                this.x += 5;
            if (keyIsDown(DOWN_ARROW) && !this.freezeY)
                this.y -= 5;
            if (keyIsDown(UP_ARROW) && !this.freezeY)
                this.y += 5;
        }
    }

    getWidth() {
        return this.imageWidth * this.size;
    }

    getHeight() {
        return this.imageHeight * this.size;
    }

    isClicked(x: number, y: number, image: p5.Image) {
        const screenxy = worldToScreen(this.x, this.y);
        const image_width = this.getWidth();
        const image_height = this.getHeight();
        const catl = screenxy[0] - image_width / 2;
        const catr = screenxy[0] + image_width / 2;
        const catt = screenxy[1] - image_height / 2;
        const catb = screenxy[1] + image_height / 2;
        let result = false;
        if (catl < x && catr > x && catt < y && catb > y) {
            const inImageX = floor((x - catl) / image_width * image.width);
            const inImageY = floor((y - catt) / image_height * image.height);
            const pixel_color = image.get(inImageX, inImageY);
            result = alpha(pixel_color) > 127;
        }
        if (result && this.draggable) {
            this.dragging = true;
        }
        return result;
    }

    mouseDragged(xChange: number, yChange: number) {
        if (this.dragging) {
            if (!this.freezeX)
                this.x += xChange;
            if (!this.freezeY)
                this.y -= yChange;
        }
    }

    mouseReleased() {
        this.dragging = false;
    }

    wait(time: number) {
        this.appendAction(new WaitAction(time));
    }

    queueSetVisible(visible: boolean) {
        this.appendAction(new SetVisible(visible));
    }

    slideTo(x: number | string, y: number | string, time: number) {
        const zero_point = screenToWorld(0, 0);
        const max_point = screenToWorld(width, height);

        if (x === 'random') {
            x = random(zero_point[0], max_point[0]);
        }
        if (y === 'random') {
            y = random(zero_point[1], max_point[1]);
        }

        this.appendAction(new SlideToAction(x as number, y as number, time));
    }

    slideChange(x: number | string, y: number | string, time: number) {
        const zero_point = screenToWorld(0, 0);
        const max_point = screenToWorld(width, height);

        if (x === 'random') {
            x = random(zero_point[0], max_point[0]);
        }
        if (y === 'random') {
            y = random(zero_point[1], max_point[1]);
        }

        this.appendAction(new SlideChangeAction(x as number, y as number, time));
    }

    moveTo(x: number | string, y: number | string) {
        const zero_point = screenToWorld(0, 0);
        const max_point = screenToWorld(width, height);
        if (x === 'random')
            x = random(zero_point[0], max_point[0]);
        if (x === null)
            x = this.x;
        if (y === 'random')
            y = random(zero_point[1], max_point[1]);
        if (y === null)
            y = this.y;
        this.x = x as number;
        this.y = y as number;
    }

    appendAction(action: FigureAction) {
        this.actionQueue.push(action);
    }

    insertAction(action: FigureAction) {
        this.actionQueue.unshift(action);
    }

    clearActions() {
        this.actionQueue = [];
    }
}

export function screenToWorld(x: number, y: number) {
    let world_x = x - width / 2;
    let world_y = y - height / 2;
    return [world_x, world_y];
}

export function worldToScreen(x: number, y: number, p: p5) {
    let screen_x = x + p.width / 2;
    let screen_y = -y + p.height / 2;
    return [screen_x, screen_y];
}
