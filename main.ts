import p5 from 'p5';
import {ScenePlayer} from "./src/scene-player";
import {AnimationSceneExample} from "./src/animation-scene-example";
import {InteractiveSceneExample} from "./src/interactive-scene-example";

export function initP5() {

  new p5((p, width = 1000, height = 400) => {
    let scenePlayer = new ScenePlayer();

    p.setup = () => {
      p.createCanvas(width, height).parent('sketch-holder');

      scenePlayer.load(
          p,
          ["assets/01_intro.mp3", "assets/meow.mp3"],
          ["assets/cat.png", "assets/hedgehog.png"]
      ).then(() => {});
    };

    p.draw = () => {
      p.background(30);

      scenePlayer.update(p);
    };

    p.keyTyped = () => {
    }

    p.mouseClicked = () => {
      // const scene = new AnimationSceneExample();
      const scene = new InteractiveSceneExample();
      scenePlayer.setScene(scene);
      scenePlayer.play();
    }
  });
}
