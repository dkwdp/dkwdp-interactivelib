import {Audio, AudioPlayer, SpriteBuffer, AudioBuf} from "./media";
import p5 from "p5";
import {Context, Scene} from "./scene";
import {DkwdpKeyboardEvent, DkwdpMouseEvent, DkwdpMouseMoveEvent, DkwdpMouseWheelEvent, Evt} from "./event";
import {CoordinateSystem} from "./coordinates";

const MAX_TIME_EPSILON = 0.001;


export class ScenePlayer {
    private readonly p: p5;
    private readonly sceneBuffer: Map<string, Scene>;
    private readonly startScene: string;
    private readonly audioBuffer: AudioBuf;
    private readonly spriteBuffer: SpriteBuffer;
    private readonly audioCtx: AudioContext;
    private loaded: boolean = false;
    private initialized: boolean = false;
    private currentScene: Scene | null = null;

    /* The timepoint when the currentAnimationScene was started in the time system of the audioCtx */
    private currentSceneStartTime: number = 0;

    private currentAudioPlayers: Map<string, AudioPlayer>;
    private spontaneousAudioPlayers: AudioPlayer[];

    private coordinateSystem: CoordinateSystem;
    private events: Evt[] = [];

    private lastMouseX: number = NaN;
    private lastMouseY: number = NaN;

    constructor(p: p5, sceneBuffer: Map<string, Scene>, startScene: string) {
        this.p = p;
        this.sceneBuffer = sceneBuffer;
        this.startScene = startScene;
        this.audioBuffer = new AudioBuf();
        this.spriteBuffer = new SpriteBuffer();
        this.audioCtx = new window.AudioContext();
        this.currentAudioPlayers = new Map();
        this.spontaneousAudioPlayers = [];
        this.coordinateSystem = new CoordinateSystem();
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

        this.coordinateSystem = CoordinateSystem.default(this.p.width, this.p.height);

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

        window.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
        });
    }

    createContext(): Context {
        const globalTime = this.audioCtx.currentTime;
        const currentSceneTime = this.currentTime(globalTime);
        return new Context(currentSceneTime, globalTime, this.p, this.spriteBuffer, this.spontaneousAudioPlayers, this.audioBuffer, this.events, this.coordinateSystem);
    }

    setScene(scene: Scene) {
        if (!scene) throw new Error(`Scene is ${scene} but should be a Scene`);
        this.currentScene = scene;
        const context = this.createContext();
        this.currentSceneStartTime = context.globalTime;
        this.currentScene.init(context);
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
        if (!this.loaded || !this.initialized || !this.currentScene) {
            this.renderStartScreen();
            return;
        }

        this.coordinateSystem.use(this.p);

        const context = this.createContext();
        this.currentScene!.update(context);

        this.events = [];

        this.handleAudio(context.audios, context.globalTime);
        this.handleNextScene(context.nextScene);
    }

    private renderStartScreen() {
        this.p.background(220);
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(42);
        this.p.fill(0);
        if (!this.loaded) {
            this.p.text('Bilder werden geladen...', this.p.width / 2, this.p.height / 2);
        } else if (!this.initialized) {
            this.p.text('Zum Starten Klicken ;)', this.p.width / 2, this.p.height / 2);
        }
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