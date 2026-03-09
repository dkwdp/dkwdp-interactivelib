export type EventKind = 'keydown' | 'keyup' | 'keytyped' | 'mousedown' | 'mouseup' | 'click' | 'mousemove' | 'mousewheel';

// TODO: Coordinate systems for positions
// TODO: Add MouseWheelEvent

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
    button: {left: boolean, right: boolean, center: boolean};
}

export interface DkwdpMouseMoveEvent extends BaseEvent {
    kind: 'mousemove';
    x: number;
    y: number;
    dx: number;
    dy: number;
    dragging: boolean;
}

export interface DkwdpMouseWheelEvent extends BaseEvent {
    kind: 'mousewheel';
    wheelX: number;
    wheelY: number;
}

export type Evt = DkwdpKeyboardEvent | DkwdpMouseEvent | DkwdpMouseMoveEvent | DkwdpMouseWheelEvent;