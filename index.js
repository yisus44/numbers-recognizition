import { analyzeConvulutional } from "./lib/analyzeConvulutional.js";
import { analyzeSequencial } from "./lib/anaylzeSequential.js";

// Get the canvas element
const canvas = document.getElementById("canva");
const smallCanvas = document.getElementById("smallcanvas");

const btnClean = document.getElementById("btn-clean");
const btnSend = document.getElementById("btn-send");

const ctx = canvas.getContext("2d");
const ctx2 = smallCanvas.getContext("2d");

let isDrawing = false;
let x = 0;
let y = 0;

// Add an event listener for when the mouse button is pressed
canvas.addEventListener("mousedown", function (e) {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

// Add an event listener for when the mouse is moved
canvas.addEventListener("mousemove", function (e) {
  if (isDrawing === true) {
    drawLine(x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

// Add an event listener for when the mouse button is released
canvas.addEventListener("mouseup", function (e) {
  isDrawing = false;
});

// Function to draw
function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 10;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}

btnClean.addEventListener("click", function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

btnSend.addEventListener("click", function () {
  analyzeSequencial(ctx2, canvas, smallCanvas);
  analyzeConvulutional(ctx2, canvas, smallCanvas);
});
(async () => {
  window.modeloSeq = await tf.loadLayersModel("./assets/model-seq.json");
  window.modeloConvu = await tf.loadLayersModel("./assets/model-conv.json");
})();
