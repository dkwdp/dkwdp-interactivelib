import {Sprite} from "./sprite";

export class Audio {
    public audio: string;
    public time: number;

    constructor(audio: string, time: number) {
        this.audio = audio;
        this.time = time;
    }
}

export class SceneState {
    public sprites: Sprite[];
    public audios: Audio[] = []

    constructor(sprites: Sprite[] = [], audios: Audio[]) {
        this.sprites = sprites;
        this.audios = audios;
    }
}
