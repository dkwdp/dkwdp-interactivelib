import p5 from 'p5';
import { AudioPlayer, AudioSegment } from './src/audio-player';
import { Shield, drawGrid } from './src';

export function initP5() {
  new p5((p, width = 800, height = 800) => {
    let myShield: Shield;
    let audioPlayer: AudioPlayer;

    p.setup = () => {
      p.createCanvas(width, height).parent('sketch-holder');
      // Pass the 'p' instance to the library class
      myShield = new Shield(p, 200, 200, 50);
      audioPlayer = new AudioPlayer(p, [new AudioSegment('assets/01_intro.mp3')]);
    };

    p.draw = () => {
      p.background(30);

      // Pass the 'p' instance to the library function
      drawGrid(p, 40);

      myShield.display();
      audioPlayer.update();
      audioPlayer.draw();
    };

    p.keyTyped = () => {
      audioPlayer.keyTyped();
    }

    p.mouseClicked = () => {
      audioPlayer.handleClick(p.mouseX, p.mouseY).then(r => console.log('yes'));
    }
  });
}
