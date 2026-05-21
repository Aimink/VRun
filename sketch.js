let particles = [];
let hoverButton = false;
let hoverClear = false;
let hoverExit = false;
let paintMode = false;
let phase = 0;

let poster;
let brush;

let buttonX = 0;
let buttonY = 0;
let buttonW = 0;
let buttonH = 0;

let clearX = 0;
let clearY = 0;
let clearW = 0;
let clearH = 0;

let exitX = 0;
let exitY = 0;
let exitW = 92;
let exitH = 36;

let paintLayer;

let spring = 0.5;
let friction = 0.5;
let brushSize = 18;
let diff;

let brushX = 0;
let brushY = 0;
let brushAX = 0;
let brushAY = 0;
let brushA = 0;
let brushR = 0;
let brushActive = false;

function preload() {
  poster = loadImage("vrun.png");
  brush = loadImage("pinceau.png", img => img.filter(INVERT));
}

function setup() {
  const container = document.getElementById("vrun-p5");
  const w = container.clientWidth;
  const h = container.clientHeight;

  const cnv = createCanvas(w, h);
  cnv.parent("vrun-p5");

  rectMode(CENTER);
  noCursor();

  initParticles();

  paintLayer = createGraphics(w, h);
  paintLayer.clear();

  diff = brushSize / 8;
}

function isMobileLayout() {
  return window.innerWidth < 700;
}

function initParticles() {
  particles = [];
  let count = min(120, max(50, floor((width * height) / 18000)));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      s: random(6, 18),
      dx: random(-0.18, 0.18),
      dy: random(-0.18, 0.18),
      a: random(18, 70),
      rot: random(TWO_PI),
      drot: random(-0.008, 0.008)
    });
  }
}

function draw() {
  background(8, 10, 20);

  drawGradient();
  drawAura();
  drawPoster();
  drawTriangles();

  drawButton();

  updateBrushPainting();
  image(paintLayer, 0, 0);

  drawButtonLabel();
  drawHelpBox();

  if (isMobileLayout()) {
    drawClearButton();
  }

  drawExitButton();
  drawCursor();

  phase += 0.01;
}

function drawGradient() {
  noStroke();

  for (let y = 0; y < height; y += 3) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(10, 8, 18), color(28, 24, 52), inter);

    fill(c);
    rect(width / 2, y, width, 4);
  }
}

function drawAura() {
  let ax = isMobileLayout() ? width * 0.5 : width * 0.3;
  let ay = isMobileLayout() ? height * 0.44 : height * 0.5;

  noStroke();

  for (let i = 7; i > 0; i--) {
    let rr = i * (isMobileLayout() ? 90 : 120) + sin(phase + i) * 8;

    fill(180, 120, 255, 10);
    ellipse(ax, ay, rr, rr * 0.9);
  }
}

function drawPoster() {
  if (!poster) return;

  push();
  imageMode(CENTER);

  let isMobile = isMobileLayout();

  let zoneW = isMobile ? width : width * 0.58;
  let zoneH = isMobile ? height * 0.68 : height;

  let px =
    zoneW * 0.5 +
    sin(frameCount * 0.01) * (isMobile ? 2 : 4);

  let py =
    zoneH * (isMobile ? 0.42 : 0.5) +
    cos(frameCount * 0.01) * (isMobile ? 1.5 : 3);

  let fitScale = min(zoneW / poster.width, zoneH / poster.height);
  let scaleFactor = isMobile ? fitScale * 0.72 : fitScale * 0.82;

  let pw = poster.width * scaleFactor;
  let ph = poster.height * scaleFactor;

  noStroke();

  for (let i = 5; i > 0; i--) {
    fill(255, 120, 220, 8);
    ellipse(px, py, pw * 0.42 + i * 36, ph * 0.42 + i * 36);
  }

  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = "rgba(180,120,255,0.22)";
  image(poster, px, py, pw, ph);
  drawingContext.shadowBlur = 0;

  pop();
}

function drawTriangles() {
  noFill();
  strokeWeight(1.2);

  for (let p of particles) {
    p.x += p.dx;
    p.y += p.dy;
    p.rot += p.drot;

    if (p.x < -30) p.x = width + 30;
    if (p.x > width + 30) p.x = -30;
    if (p.y < -30) p.y = height + 30;
    if (p.y > height + 30) p.y = -30;

    push();
    translate(p.x, p.y);
    rotate(p.rot + sin(phase + p.x * 0.01) * 0.2);

    stroke(235, 240, 255, p.a);

    triangle(
      -p.s * 0.8, p.s * 0.6,
      0, -p.s * 0.8,
      p.s * 0.8, p.s * 0.6
    );

    pop();
  }
}

function drawButton() {
  let isMobile = isMobileLayout();

  if (isMobile) {
    buttonW = width * 0.40;
    buttonH = 54;
    buttonX = width * 0.70;
    buttonY = height * 0.84;
  } else {
    buttonW = 280;
    buttonH = 58;
    buttonX = width * 0.76;
    buttonY = height * 0.5;
  }

  hoverButton = isOverMainButton(mouseX, mouseY);

  if (hoverButton) {
    fill(255, 90, 180, 90);
    stroke(255, 120, 200, 220);
  } else if (paintMode) {
    fill(255, 90, 180, 55);
    stroke(255, 120, 200, 160);
  } else {
    fill(255, 255, 255, 14);
    stroke(255, 255, 255, 90);
  }

  strokeWeight(1.2);
  rect(buttonX, buttonY, buttonW, buttonH, 12);
}

function drawButtonLabel() {
  push();

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(isMobileLayout() ? 14 : 18);

  drawingContext.shadowBlur = 8;
  drawingContext.shadowColor = "rgba(0,0,0,0.45)";

  text(paintMode ? "ITCH.IO VRUN" : "PLAY", buttonX, buttonY - 1);

  drawingContext.shadowBlur = 0;

  pop();
}

function drawHelpBox() {

  if (!paintMode) return;

  let hx;
  let hy;

  if (isMobileLayout()) {

    hx = width * 0.5;
    hy = height * 0.66;

  } else {

    hx = width * 0.76;
    hy = height * 0.6;
  }

  push();

  noStroke();

  fill(255, 90, 180);

  textAlign(CENTER, CENTER);

  textSize(
    isMobileLayout()
      ? 13
      : 15
  );

  if (isMobileLayout()) {

    text(
      "PAINT WITH YOUR FINGER",
      hx,
      hy
    );

  } else {

    text(
      "CLICK TO PAINT\n(Press C to clear)",
      hx,
      hy
    );
  }

  pop();
}

function drawClearButton() {
  if (!paintMode) return;

  clearW = 92;
  clearH = 36;

  if (isMobileLayout()) {
    clearX = width * 0.24;
    clearY = height * 0.79;
  } else {
    clearX = width * 0.76;
    clearY = height * 0.76;
  }

  hoverClear = isOverClearButton(mouseX, mouseY);

  push();

  if (hoverClear) {
    fill(80, 180, 255, 40);
    stroke(120, 220, 255, 220);
  } else {
    fill(255, 255, 255, 10);
    stroke(255, 255, 255, 80);
  }

  strokeWeight(1);
  rect(clearX, clearY, clearW, clearH, 10);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text("CLEAR", clearX, clearY - 1);

  pop();
}

function drawExitButton() {


  if (!paintMode || !isMobileLayout()) return;

  exitW = 92;
  exitH = 36;

  if (isMobileLayout()) {
    exitX = width * 0.24;
    exitY = height * 0.88;
  } else {
    exitX = width * 0.76;
    exitY = height * 0.7;
  }

  hoverExit = isOverExitButton(mouseX, mouseY);

  push();

  if (hoverExit) {
    fill(255, 90, 120, 40);
    stroke(255, 120, 150, 220);
  } else {
    fill(255, 255, 255, 10);
    stroke(255, 255, 255, 80);
  }

  strokeWeight(1);
  rect(exitX, exitY, exitW, exitH, 10);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text("EXIT", exitX, exitY - 1);

  pop();
}

function resetBrushStroke() {
  brushAX = 0;
  brushAY = 0;
  brushA = 0;
  brushR = brushSize;
  brushActive = false;
}

function updateBrushPainting() {
  if (!paintMode) {
    resetBrushStroke();
    return;
  }

  let isDrawingNow = isMobileLayout() ? touches.length > 0 : mouseIsPressed;

  if (
    isOverMainButton(mouseX, mouseY) ||
    isOverClearButton(mouseX, mouseY) ||
    isOverExitButton(mouseX, mouseY)
  ) {
    isDrawingNow = false;
  }

  if (!isDrawingNow) {
    resetBrushStroke();
    return;
  }

  let targetX = constrain(mouseX, 0, width);
  let targetY = constrain(mouseY, 0, height);

  let moved = dist(mouseX, mouseY, pmouseX, pmouseY) > 0.5;

  if (!brushActive) {
    brushActive = true;
    brushX = targetX;
    brushY = targetY;
    brushAX = 0;
    brushAY = 0;
    brushA = 0;
    brushR = brushSize;
    return;
  }

  if (!moved) return;

  let oldR = brushR;

  brushAX += (targetX - brushX) * spring;
  brushAY += (targetY - brushY) * spring;

  brushAX *= friction;
  brushAY *= friction;

  brushA += sqrt(brushAX * brushAX + brushAY * brushAY) - brushA;
  brushA *= 0.6;

  brushR = brushSize - brushA;

  if (brushR < 1) brushR = 1;

  paintLayer.stroke(255, 255, 255, 70);
  paintLayer.noFill();

  let distanceSteps = 8;

  for (let i = 0; i < distanceSteps; i++) {
    let oldX = brushX;
    let oldY = brushY;

    brushX += brushAX / distanceSteps;
    brushY += brushAY / distanceSteps;

    oldR += (brushR - oldR) / distanceSteps;

    if (oldR < 1) oldR = 1;

    paintLayer.strokeWeight(oldR + diff);
    paintLayer.line(brushX, brushY, oldX, oldY);

    paintLayer.strokeWeight(oldR);
    paintLayer.line(
      brushX + diff * 2,
      brushY + diff * 2,
      oldX + diff * 2,
      oldY + diff * 2
    );

    paintLayer.line(
      brushX - diff,
      brushY - diff,
      oldX - diff,
      oldY - diff
    );
  }
}

function drawCursor() {
  if (isMobileLayout()) return;

  push();
  imageMode(CENTER);

  if (paintMode && brush) {
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = "rgba(255,120,200,0.55)";

    translate(mouseX, mouseY);
    rotate(-0.6 + sin(frameCount * 0.05) * 0.08);

    image(brush, 0, 0, 38, 38);

    drawingContext.shadowBlur = 0;
  } else {
    translate(mouseX, mouseY);

    stroke(255, 255, 255, 190);
    strokeWeight(1.2);
    noFill();

    let r1 = 18 + sin(frameCount * 0.08) * 1.5;
    let r2 = 30 + sin(frameCount * 0.06) * 2;

    ellipse(0, 0, r1, r1);
    ellipse(0, 0, r2, r2);

    line(-10, 0, 10, 0);
    line(0, -10, 0, 10);

    fill(255, 255, 255, 180);
    noStroke();
    ellipse(0, 0, 3, 3);
  }

  pop();
}

function mousePressed() {
  if (isOverExitButton(mouseX, mouseY)) {
    exitPaintMode();
    return false;
  }

  if (isOverMainButton(mouseX, mouseY)) {
    if (!paintMode) {
      enterPaintMode();
    } else {
      openVRunExperience();
    }

    return false;
  }

  return paintMode ? false : true;
}

function touchStarted() {
  const t = touches && touches.length ? touches[0] : { x: mouseX, y: mouseY };

  if (isOverExitButton(t.x, t.y)) {
    exitPaintMode();
    return false;
  }

  if (isOverMainButton(t.x, t.y)) {
    if (!paintMode) {
      enterPaintMode();
    } else {
      openVRunExperience();
    }

    return false;
  }

  if (isOverClearButton(t.x, t.y)) {
    paintLayer.clear();
    return false;
  }

  return paintMode ? false : true;
}

function touchMoved() {
  return paintMode ? false : true;
}

function touchEnded() {
  resetBrushStroke();
  return paintMode ? false : true;
}

function mouseReleased() {
  resetBrushStroke();
}

function keyPressed() {
  if (key === "c" || key === "C") {
    paintLayer.clear();
  }

  if (keyCode === ESCAPE) {
    exitPaintMode();
  }
}

function windowResized() {
  const container = document.getElementById("vrun-p5");

  const w = container.offsetWidth;
  const h = container.offsetHeight;

  resizeCanvas(w, h);

  paintLayer = createGraphics(w, h);
  paintLayer.clear();

  initParticles();
}

function enterPaintMode() {
  paintMode = true;
  document.body.classList.add("paint-mode");
}

function exitPaintMode() {
  paintMode = false;
  document.body.classList.remove("paint-mode");
  resetBrushStroke();
}

function isOverMainButton(x, y) {
  return (
    x > buttonX - buttonW / 2 &&
    x < buttonX + buttonW / 2 &&
    y > buttonY - buttonH / 2 &&
    y < buttonY + buttonH / 2
  );
}

function isOverClearButton(x, y) {
  return (
    paintMode &&
    x > clearX - clearW / 2 &&
    x < clearX + clearW / 2 &&
    y > clearY - clearH / 2 &&
    y < clearY + clearH / 2
  );
}

function isOverExitButton(x, y) {

    if (!isMobileLayout()) return false;

  return (
    paintMode &&
    x > exitX - exitW / 2 &&
    x < exitX + exitW / 2 &&
    y > exitY - exitH / 2 &&
    y < exitY + exitH / 2
  );
}

function openVRunExperience() {
  window.open(
    "https://raphaelmarczak.itch.io/vrun?password=FILWS",
    "_blank",
    "noopener"
  );
}