import {Audio} from "./audio";
import p5 from "p5";
import {AnimationScene} from "./animation-scene";
import {Figure, worldToScreen} from "./figure";
import {Sprite} from "./sprite";

class AudioBuffer {
    private audios: Map<string, Audio>;

    constructor() {
        this.audios = new Map();
    }

    /**
     * Loads the given audios.
     * @param audios An array of audios, given as tuple [name, filename]. The name is a unique identifier for the audio.
     * @param audioCtx The AudioContext to use for playback.
     * The filename is the path to the audio file.
     */
    async load(audios: [string, string][], audioCtx: AudioContext) {
        for (const [name, filename] of audios) {
            const audio = new Audio(filename, audioCtx);
            await audio.load();
            this.audios.set(name, audio);
        }
    }

    /**
     * Returns the audio segment with the given name.
     * @param audio The name of the audio.
     * @returns The audio
     */
    get(audio: string): Audio {
        const result = this.audios.get(audio);
        if (!result)
            throw new Error(`Audio segment not found: ${audio}`);
        return result;
    }
}

class SpriteBuffer {
    private sprites: Map<string, p5.Image>

    constructor() {
        this.sprites = new Map();
    }

    async load(sprites: [string, string][], p: p5) {
        for (const [name, filename] of sprites) {
            const sprite = await p.loadImage(filename);
            console.log(name, sprite);
            this.sprites.set(name, sprite);
        }
    }

    get(sprite: string): p5.Image {
        const result = this.sprites.get(sprite) || null;
        if (!result)
            throw new Error(`Sprite not found: ${sprite}`);
        return result;
    }
}

export class ScenePlayer {
    private readonly audioBuffer: AudioBuffer;
    private readonly spriteBuffer: SpriteBuffer;
    private readonly audioCtx: AudioContext;
    private loaded: boolean = false;
    private currentScene: AnimationScene | null = null;
    private playing: boolean = false;

    /* The when the currentScene was started in the time system of the audioCtx */
    private currentSceneStartTime: number = 0;

    constructor() {
        this.audioBuffer = new AudioBuffer();
        this.spriteBuffer = new SpriteBuffer();
        this.audioCtx = new window.AudioContext();
    }

    async load(p: p5, audios: [string, string][], sprites: [string, string][]) {
        await this.audioBuffer.load(audios, this.audioCtx);
        await this.spriteBuffer.load(sprites, p);
        this.loaded = true;
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    setScene(scene: AnimationScene) {
        this.currentScene = scene;
        this.currentSceneStartTime = this.audioCtx.currentTime;
    }

    play() {
        this.audioCtx.resume().then(() => { console.log("Playback resumed"); });
        this.playing = true;
    }

    /**
     * Returns the time that the current scene has been playing for in seconds.
     */
    currentTime(): number {
        if (!this.loaded) return -1;
        return this.audioCtx.currentTime - this.currentSceneStartTime;
    }

    update(p: p5) {
        if (!this.loaded || !this.currentScene) return;

        const currentSceneTime = this.currentTime();

        const state = this.currentScene.render(currentSceneTime);

        // TODO handle audio

        // handle figures
        for (const sprite of state.sprites) {
            renderSprite(sprite, this.spriteBuffer, p);
        }
    }
}

export function renderSprite(sprite: Sprite, spriteBuffer: SpriteBuffer, p: p5) {
    let image = spriteBuffer.get(sprite.spriteId);
    let world_xy = worldToScreen(sprite.x, sprite.y, p);
    p.image(image, world_xy[0], world_xy[1], image.width * sprite.size, image.height * sprite.size);
}