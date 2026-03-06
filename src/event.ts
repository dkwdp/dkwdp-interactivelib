export type EventKind = 'keydown' | 'keyup' | 'keytyped' | 'mousedown' | 'mouseup' | 'click' | 'mousemove';

// TODO: Coordinate systems for positions

export interface BaseEvent {
    kind: EventKind;
    timestamp: number;
}

export interface DkwdpKeyboardEvent extends BaseEvent {
    kind: 'keydown' | 'keyup' | 'keytyped';
    key: string;
    code: string;
    keyCode: number;
    shiftKey: boolean;
    ctrlKey: boolean;
}

export interface DkwdpMouseEvent extends BaseEvent {
    kind: 'mousedown' | 'mouseup' | 'click';
    x: number;
    y: number;
    button: number;
}

export interface DkwdpMouseMoveEvent extends BaseEvent {
    kind: 'mousemove';
    x: number;
    y: number;
    dx: number;
    dy: number;
}

export type Evt = DkwdpKeyboardEvent | DkwdpMouseEvent | DkwdpMouseMoveEvent;