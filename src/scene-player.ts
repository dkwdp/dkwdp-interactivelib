import {Audio, AudioFile, AudioPlayer} from "./audio";
import p5 from "p5";
import {Scene} from "./scene";
import {DkwdpKeyboardEvent, DkwdpMouseEvent, DkwdpMouseMoveEvent, DkwdpMouseWheelEvent, Evt} from "./event";

const MAX_TIME_EPSILON = 0.001;

export class AudioBuffer {
    private audios: Map<string, AudioFile>;

    constructor() {
        this.audios = new Map();
    }

    /**
     * Loads the given audios.
     * @param audios An array of audios, given as tuple [name, filename]. The name is a unique identifier for the audio.
     * @param audioCtx The AudioContext to use for playback.
     * The filename is the path to the audio file.
     */
    async load(audios: string[], audioCtx: AudioContext) {
        for (const filename of audios) {
            const audio = new AudioFile(filename, audioCtx);
            await audio.load();
            this.audios.set(filename, audio);
        }
    }

    /**
     * Returns the audio segment with the given name.
     * @param audio The name of the audio.
     * @returns The audio
     */
    get(audio: string): AudioFile {
        const result = this.audios.get(audio);
        if (!result)
            throw new Error(`Audio segment not found: ${audio}`);
        return result;
    }
}

export class SpriteBuffer {
    private sprites: Map<string, p5.Image>

    constructor() {
        this.sprites = new Map();
    }

    /**
     * Loads a set of sprite images and stores them in the sprites map.
     *
     * @param sprites - An array of file paths to the sprite images.
     * @param p - An instance of the p5 library used to load the images.
     * @return A promise that resolves once all images are loaded and stored.
     */
    async load(sprites: string[], p: p5) {
        for (const filename of sprites) {
            const sprite = await p.loadImage(filename);
            this.sprites.set(filename, sprite);
        }
    }

    get(sprite: string): p5.Image {
        const result = this.sprites.get(sprite) || null;
        if (!result)
            throw new Error(`Sprite not found: ${sprite}`);
        return result;
    }
}

export class RenderContext {
    p: p5;
    spriteBuffer: SpriteBuffer;

    constructor(p: p5, spriteBuffer: SpriteBuffer) {
        this.p = p;
        this.spriteBuffer = spriteBuffer;
    }

    /**
     * Renders a sprite at the given position.
     * @param sprite The sprite to render.
     * @param x The x-coordinate of the sprite's center.
     * @param y The y-coordinate of the sprite's center.
     * @param size The size of the sprite.
     * @param rotation The rotation of the sprite in radians.
     * @param alpha The opacity of the sprite.
     *
     * TODO: use coordinate system, use rotation
     */
    renderSprite(sprite: string, x: number, y: number, size: number = 1.0, rotation: number = 0, alpha: number = 1.0) {
        let image = this.spriteBuffer.get(sprite);
        if (alpha < 1.0) {
            this.p.tint(255, alpha * 255);
        }
        this.p.image(image, x, y, image.width * size, image.height * size);
        if (alpha < 1.0) {
            this.p.tint(255, 255);
        }
    }
}

export class AudioEngine {
    // noinspection JSMismatchedCollectionQueryUpdate
    private readonly audioPlayers: AudioPlayer[];
    private readonly audioBuffer: AudioBuffer;
    private readonly globalTime: number;

    constructor(audioPlayers: AudioPlayer[], audioBuffer: AudioBuffer, globalTime: number) {
        this.audioPlayers = audioPlayers;
        this.audioBuffer = audioBuffer;
        this.globalTime = globalTime;
    }

    playAudio(filename: string, offset: number = 0) {
        const source = this.audioBuffer.get(filename);
        if (!source) throw new Error(`Audio file not found: ${filename}`);
        const player = source.createPlayer();
        player.play(offset, this.globalTime);
        this.audioPlayers.push(player);
    }
}

export class ScenePlayer {
    private readonly p: p5;
    private readonly sceneBuffer: Map<string, Scene>;
    private readonly startScene: string;
    private readonly audioBuffer: AudioBuffer;
    private readonly spriteBuffer: SpriteBuffer;
    private readonly audioCtx: AudioContext;
    private loaded: boolean = false;
    private initialized: boolean = false;
    private currentScene: Scene | null = null;

    /* The timepoint when the currentAnimationScene was started in the time system of the audioCtx */
    private currentSceneStartTime: number = 0;

    private currentAudioPlayers: Map<string, AudioPlayer>;
    private spontaneousAudioPlayers: AudioPlayer[];

    private events: Evt[] = [];

    private lastMouseX: number = NaN;
    private lastMouseY: number = NaN;

    constructor(p: p5, sceneBuffer: Map<string, Scene>, startScene: string) {
        this.p = p;
        this.sceneBuffer = sceneBuffer;
        this.startScene = startScene;
        this.audioBuffer = new AudioBuffer();
        this.spriteBuffer = new SpriteBuffer();
        this.audioCtx = new window.AudioContext();
        this.currentAudioPlayers = new Map();
        this.spontaneousAudioPlayers = [];
    }

    /**
     * Loads audio and sprite resources into buffers and marks the instance as loaded.
     * Also sets up event handlers for keyboard and mouse events.
     *
     * @param audios - An array of audio file paths to be loaded into the audio buffer.
     * @param sprites - An array of sprite file paths to be loaded into the sprite buffer.
     * @return A promise that resolves when all resources are successfully loaded.
     */
    async load(audios: string[], sprites: string[]) {
        await this.audioBuffer.load(audios, this.audioCtx);
        await this.spriteBuffer.load(sprites, this.p);
        this.loaded = true;

        // keyboard events
        this.p.keyPressed = () => { this.keyPressed(); };
        this.p.keyTyped = () => { this.keyTyped(); };
        this.p.keyReleased = () => { this.keyReleased(); };

        // mouse events
        this.p.mouseClicked = () => {
            // TODO: rework this
            if (!this.initialized) {
                this.setScene(this.sceneBuffer.get(this.startScene)!);
                this.play();
            }
        }
        this.p.mouseMoved = () => { this.mouseMoved(); };
        this.p.mouseDragged = () => { this.mouseDragged(); };
        this.p.mouseWheel = (event: WheelEvent) => { this.mouseWheel(event); };
        this.p.mouseReleased = (evt: MouseEvent) => { this.mouseReleased(evt); };
        this.p.mousePressed = (evt: MouseEvent) => { this.mousePressed(evt); };
    }

    setScene(scene: Scene) {
        if (!scene) throw new Error(`Scene is ${scene} but should be a Scene`);
        this.currentScene = scene;
        this.currentSceneStartTime = this.audioCtx.currentTime;
        this.currentScene.init(
            new RenderContext(this.p, this.spriteBuffer),
            new AudioEngine(this.spontaneousAudioPlayers, this.audioBuffer, this.audioCtx.currentTime),
        )
    }

    play() {
        this.audioCtx.resume().then(() => {
            this.initialized = true;
        });
    }

    /**
     * Returns the time that the current scene has been playing for in seconds.
     */
    currentTime(globalTime: number): number {
        if (!this.loaded) return -1;
        return globalTime - this.currentSceneStartTime;
    }

    update() {
        if (!this.loaded || !this.initialized || !this.currentScene) return;

        const globalTime = this.audioCtx.currentTime;
        const currentSceneTime = this.currentTime(globalTime);
        const update = this.currentScene!.update(
            currentSceneTime,
            new RenderContext(this.p, this.spriteBuffer),
            new AudioEngine(this.spontaneousAudioPlayers, this.audioBuffer, globalTime),
            this.events
        );

        this.events = [];

        this.handleAudio(update.audios, globalTime);
        this.handleNextScene(update.nextScene);
    }

    handleNextScene(nextScene: string | null) {
        if (nextScene === null) return;

        this.resetAudio();

        const scene = this.sceneBuffer.get(nextScene);
        if (!scene) throw new Error(`Unable to find scene "${nextScene}"`);

        this.setScene(scene);
    }

    handleAudio(audios: Audio[], globalTime: number) {
        // handle current audio players
        const usedPlayers = new Map<string, AudioPlayer>();
        for (const audio of audios) {
            const player = this.currentAudioPlayers.get(audio.filename);
            let newPlayerNeeded = true;
            if (player) {
                // remove player, if too far off
                if (Math.abs(player.getPosition(globalTime) - audio.time) > MAX_TIME_EPSILON) {
                    player.stop();
                    this.currentAudioPlayers.delete(audio.filename);
                } else {
                    newPlayerNeeded = false;
                    usedPlayers.set(audio.filename, player);
                }
            }
            if (newPlayerNeeded) {
                const source = this.audioBuffer.get(audio.filename)
                if (audio.isValid(source.duration())) {
                    const player = source.createPlayer();
                    player.play(audio.time, globalTime);
                    this.currentAudioPlayers.set(audio.filename, player);
                    usedPlayers.set(audio.filename, player);
                }
            }
        }

        // Stop unused players
        for (const [filename, player] of this.currentAudioPlayers) {
            if (!usedPlayers.has(filename)) {
                player.stop();
            }
        }
        this.currentAudioPlayers = usedPlayers;

        // handle spontaneous audio players
        this.spontaneousAudioPlayers = this.spontaneousAudioPlayers.filter(player => player.playing);
    }

    resetAudio() {
        for (const player of this.currentAudioPlayers.values()) {
            player.stop();
        }
        this.currentAudioPlayers.clear();

        for (const player of this.spontaneousAudioPlayers) {
            player.stop();
        }
        this.spontaneousAudioPlayers = [];
    }

    // keyboard events
    keyPressed() {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);
        const evt: DkwdpKeyboardEvent = {
            kind: 'keydown',
            timestamp: timestamp,
            key: this.p.key,
            code: this.p.code,
            keyCode: this.p.keyCode,
            shiftKey: this.p.keyIsDown(this.p.SHIFT),
            ctrlKey: this.p.keyIsDown(this.p.CONTROL),
        }
        this.events.push(evt);
    }

    keyTyped() {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);
        const evt: DkwdpKeyboardEvent = {
            kind: 'keytyped',
            timestamp: timestamp,
            key: this.p.key,
            code: this.p.code,
            keyCode: this.p.keyCode,
            shiftKey: this.p.keyIsDown(this.p.SHIFT),
            ctrlKey: this.p.keyIsDown(this.p.CONTROL),
        }
        this.events.push(evt);
    }

    keyReleased() {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);
        const evt: DkwdpKeyboardEvent = {
            kind: 'keyup',
            timestamp: timestamp,
            key: this.p.key,
            code: this.p.code,
            keyCode: this.p.keyCode,
            shiftKey: this.p.keyIsDown(this.p.SHIFT),
            ctrlKey: this.p.keyIsDown(this.p.CONTROL),
        }
        this.events.push(evt);
    }

    mouseReleased(event: MouseEvent) {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);
        const evt: DkwdpMouseEvent = {
            kind: 'mouseup',
            timestamp: timestamp,
            x: this.p.mouseX,
            y: this.p.mouseY,
            button: event.button,
        }
        this.events.push(evt);
    }

    mousePressed(event: MouseEvent) {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);
        const evt: DkwdpMouseEvent = {
            kind: 'mousedown',
            timestamp: timestamp,
            x: this.p.mouseX,
            y: this.p.mouseY,
            button: event.button,
        }
        this.events.push(evt);
    }

    mouseMovement(): [number, number] {
        if (Number.isNaN(this.lastMouseX) || Number.isNaN(this.lastMouseY)) {
            this.lastMouseX = this.p.mouseX;
            this.lastMouseY = this.p.mouseY;
        }

        const dx = this.p.mouseX - this.lastMouseX;
        const dy = this.p.mouseY - this.lastMouseY;

        this.lastMouseX = this.p.mouseX;
        this.lastMouseY = this.p.mouseY;

        return [dx, dy];
    }

    mouseDragged() {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);

        const [dx, dy] = this.mouseMovement();

        const evt: DkwdpMouseMoveEvent = {
            kind: 'mousemove',
            timestamp: timestamp,
            x: this.p.mouseX,
            y: this.p.mouseY,
            dx,
            dy,
            dragging: true,
        }
        this.events.push(evt);

    }

    mouseMoved() {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);

        const [dx, dy] = this.mouseMovement();

        const evt: DkwdpMouseMoveEvent = {
            kind: 'mousemove',
            timestamp: timestamp,
            x: this.p.mouseX,
            y: this.p.mouseY,
            dx,
            dy,
            dragging: false,
        }
        this.events.push(evt);

        this.lastMouseX = this.p.mouseX;
        this.lastMouseY = this.p.mouseY;
    }

    mouseWheel(event: WheelEvent) {
        if (!this.initialized) return;
        const timestamp = this.currentTime(this.audioCtx.currentTime);

        const evt: DkwdpMouseWheelEvent = {
            kind: 'mousewheel',
            timestamp: timestamp,
            wheelX: event.deltaX,
            wheelY: event.deltaY,
            x: this.p.mouseX,
            y: this.p.mouseY,
        }
        this.events.push(evt);
    }

    /*
    TODO
    doubleClicked() {
    }
     */
}