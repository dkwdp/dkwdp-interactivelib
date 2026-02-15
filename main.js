import p5 from 'p5';
import { Shield, drawGrid } from './src/dkwdp-interactivelib.js';

export function initP5() {
  new p5((p) => {
    let myShield;

    p.setup = () => {
      p.createCanvas(400, 400);
      // Pass the 'p' instance to the library class
      myShield = new Shield(p, 200, 200, 50);
    };

    p.draw = () => {
      p.background(30);

      // Pass the 'p' instance to the library function
      drawGrid(p, 40);

      myShield.display();
    };
  });
}
