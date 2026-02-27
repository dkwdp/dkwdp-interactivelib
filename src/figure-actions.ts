import p5 from "p5";
import {Figure, worldToScreen} from "./figure";

export abstract class FigureAction {
    isComplete: boolean = false;

    update(figure: Figure) {
        // Override this method in subclasses
    }
}

export class SlideToAction extends FigureAction {
    targetX: number;
    targetY: number;
    duration: number;
    startX: number | null = null;
    startY: number | null = null;
    startTime: number | null = null;

    constructor(x: number, y: number, time: number) {
        super();
        this.targetX = x;
        this.targetY = y;
        this.duration = time;
    }

    update(figure: Figure) {
        if (this.startTime === null) {
            this.startX = figure.x;
            this.startY = figure.y;
            this.startTime = millis();
        }

        const elapsed = millis() - this.startTime;
        const t = min(elapsed / this.duration, 1);
        figure.x = lerp(this.startX!, this.targetX, t);
        figure.y = lerp(this.startY!, this.targetY, t);

        if (t >= 1) {
            this.isComplete = true;
        }
    }
}

export class SlideChangeAction extends FigureAction {
    targetX: number | null = null;
    targetY: number | null = null;
    startX: number | null = null;
    startY: number | null = null;
    startTime: number | null = null;
    duration: number;
    xChange: number;
    yChange: number;

    constructor(x: number, y: number, time: number) {
        super();
        this.duration = time;
        this.xChange = x;
        this.yChange = y;
    }

    update(figure: Figure) {
        if (this.startTime === null) {
            this.startX = figure.x;
            this.startY = figure.y;
            this.targetX = this.startX! + this.xChange;
            this.targetY = this.startY! + this.yChange;
            this.startTime = millis();
        }

        const elapsed = millis() - this.startTime;
        const t = min(elapsed / this.duration, 1);
        figure.x = lerp(this.startX!, this.targetX!, t);
        figure.y = lerp(this.startY!, this.targetY!, t);

        if (t >= 1) {
            this.isComplete = true;
        }
    }
}

export class WaitAction extends FigureAction {
    duration: number;
    startTime: number | null = null;

    constructor(time: number) {
        super();
        this.duration = time;
    }

    update(figure: Figure) {
        if (this.startTime === null) {
            this.startTime = millis();
        }

        const elapsed = millis() - this.startTime;
        if (elapsed >= this.duration) {
            this.isComplete = true;
        }
    }
}

export class SetVisible extends FigureAction {
    visible: boolean;

    constructor(visible: boolean) {
        super();
        this.visible = visible;
    }

    update(figure: Figure) {
        figure.visible = this.visible;
    }
}

