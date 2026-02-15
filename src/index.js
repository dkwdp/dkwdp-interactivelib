(function () {
  p5.prototype.drawNeonRect = function (x, y, w, h, col) {
    this.push();
    this.noFill();
    this.stroke(col);
    this.strokeWeight(4);
    this.drawingContext.shadowBlur = 15;
    this.drawingContext.shadowColor = col;
    this.rect(x, y, w, h);
    this.pop();
  };

  // 2. A class that can be instantiated
  p5.prototype.NeonParticle = class {
    constructor(p, x, y) {
      this.p = p; // Store the p5 instance
      this.pos = p.createVector(x, y);
      this.vel = p5.Vector.random2D();
    }

    update() {
      this.pos.add(this.vel);
    }

    show() {
      this.p.fill(255, 0, 255);
      this.p.noStroke();
      this.p.circle(this.pos.x, this.pos.y, 10);
    }
  };
})();
