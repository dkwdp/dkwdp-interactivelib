import p5 from "p5";
export * from './audio-player';

// A standalone class that requires a p5 instance
export class Shield {
  private p: p5;
  public pos: p5.Vector;
  public r: number;
  public angle: number;

  constructor(p: p5, x: number, y: number, radius: number) {
    this.p = p; // Store the p5 instance
    this.pos = p.createVector(x, y);
    this.r = radius;
    this.angle = 0;
  }

  display() {
    this.p.push();
    this.p.translate(this.pos.x, this.pos.y);
    this.p.rotate(this.angle);
    this.p.noFill();
    this.p.stroke(0, 255, 100);
    this.p.arc(0, 0, this.r, this.r, 0, this.p.PI);
    this.p.pop();
    this.angle += 0.02;
  }
}

// A standalone utility function
export function drawGrid(p: p5, spacing: number) {
  p.stroke(200, 50);
  for (let x = 0; x < p.width; x += spacing) {
    p.line(x, 0, x, p.height);
  }
  for (let y = 0; y < p.height; y += spacing) {
    p.line(0, y, p.width, y);
  }
}
