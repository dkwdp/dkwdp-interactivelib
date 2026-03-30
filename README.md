# DKWDP-InteractiveLib

A js library on top of p5js to build interactive tutorials.

# Getting started

Clone the example project:
```shell
git clone git@github.com:Bluemi/dkwdp-tutorials.git
cd dkwdp-tutorials/minimal_template
```

Install the library:
```shell
npm install
```

Run the test server:
```sh
npx vite
```

# Usage
## Implementing scenes
Everything is implemented inside a scene. A scene is a class extending the `Scene` base class:
```ts
import {Context, Scene} from 'dkwdp-interactivelib';

export class MyScene extends Scene {
    update(context: Context) {
        // do stuff
    }
}
```

The `update()` method is called every frame. It is passed a `Context` object, which provides access to the canvas, audio, events and other utilities.

## Initializing scenes
To use scenes, add them to the `initScenes()` call in `index.html`:
```ts
initScenes(
    sketchHolder,
    [
      ["startScene", new StartScene()],
      ["myScene", new MyScene()],
    ],
    ["sound.mp3"],
    ["image.png"]
);
```

## Switching Scenes
To switch to another scene, set `context.nextScene` to the name of the scene you want to switch to:
```ts
export class MyScene extends Scene {
    update(context: Context) {
        // switch back after 5 seconds
        if (context.time > 5) {
            context.nextScene = "startScene";
        }
    }
}
```

## Sprites
If you want to add an image to your scene you can do so by creating a `Sprite` object:
```ts
import {Context, Scene, Sprite} from 'dkwdp-interactivelib';

export class MyScene extends Scene {
    mySprite: Sprite = new Sprite("image.png", 0, 0, {size: 12.0, imageMode: "center"});

    update(context: Context) {
        context.background(235);
    }
}
```

Place the `image.png` file in the `public` folder.

Also you need to place the filename `image.png` in the `initScenes()` call in `index.html`:

Sprites are drawn automatically by the `Scene` class, because the `Sprite` class implements the `InteractiveElement` interface.
Each member of the scene class, that implements the `InteractiveElement` interface, will be drawn and updated automatically.

## Interactive Elements
You can implement your own interactive elements:

```ts
import {Context, INTERACTIVE_ELEMENT_MARKER, InteractiveElement} from "dkwdpil";

export class MyElement implements InteractiveElement {
    _interactiveElementMarker: "interactiveElement" = INTERACTIVE_ELEMENT_MARKER;

    update(context: Context) {
        for (const evt of context.events) {
            if (evt.kind === "mousedown") {
                // do stuff
            }
        }
    }

    draw(context: Context) {
        context.fill(255, 0, 0);
        context.rect(-5, -5, 10, 50);
    }
}
```

Draw methods are very similar to the p5js draw methods, but with a different coordinate system.

## Coordinates
The coordinate system is a bit unusual:

- The zero point is in the center of the screen.
- The x-axis is horizontal and points to the right.
- The y-axis is vertical and points up.
- The top y-coordinate is 18 and the bottom y-coordinate is -18.
- The left x-coordinate is -32 and the right x-coordinate is 32.
- The width is always 64 and the height is always 36, resulting in a 16:9 aspect ratio.

## Events

See [the source code](https://github.com/dkwdp/dkwdp-interactivelib/blob/main/src/event.ts).