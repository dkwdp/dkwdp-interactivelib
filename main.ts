import p5 from 'p5';
import {ScenePlayer} from "./src";
import {AnimationSceneExample} from "./src/animation-scene-example";
import {InteractiveSceneExample} from "./src/interactive-scene-example";
import {Scene} from "./src";

export function initP5() {
  new p5((p, width = 1000, height = 400) => {
    let sceneBuffer = new Map<string, Scene>([
        ["initScene", new AnimationSceneExample()],
        ["scene1", new InteractiveSceneExample()],
    ]);
    let scenePlayer = new ScenePlayer(p, sceneBuffer, "initScene");

    p.setup = () => {
      p.createCanvas(width, height).parent('sketch-holder');

      scenePlayer.load(
          ["assets/01_intro.mp3", "assets/meow.mp3"],
          ["assets/cat.png", "assets/hedgehog.png"]
      ).then(() => {});
    };

    p.draw = () => {
      p.background(30);

      scenePlayer.update(p);
    };

  });
}
