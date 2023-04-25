// Get the canvas element
const canvas = document.getElementById("canva");
const smallCanvas = document.getElementById("smallcanvas");

const btnClean = document.getElementById("btn-clean");
const btnSend = document.getElementById("btn-send");

const ctx = canvas.getContext("2d");
const ctx2 = smallCanvas.getContext("2d");
// letiables for drawing
let isDrawing = false;
let x = 0;
let y = 0;
let modeloSeq = null; //Sequencial
let modeloConvu = null; //Convulucional

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

//resize
function resizeSample(canvas, width, height, resize_canvas) {
  let width_source = canvas.width;
  let height_source = canvas.height;
  width = Math.round(width);
  height = Math.round(height);

  let ratio_w = width_source / width;
  let ratio_h = height_source / height;
  let ratio_w_half = Math.ceil(ratio_w / 2);
  let ratio_h_half = Math.ceil(ratio_h / 2);

  let ctx = canvas.getContext("2d");
  let ctx2 = resize_canvas.getContext("2d");
  let img = ctx.getImageData(0, 0, width_source, height_source);
  let img2 = ctx2.createImageData(width, height);
  let data = img.data;
  let data2 = img2.data;

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let x2 = (i + j * width) * 4;
      let weight = 0;
      let weights = 0;
      let weights_alpha = 0;
      let gx_r = 0;
      let gx_g = 0;
      let gx_b = 0;
      let gx_a = 0;
      let center_y = (j + 0.5) * ratio_h;
      let yy_start = Math.floor(j * ratio_h);
      let yy_stop = Math.ceil((j + 1) * ratio_h);
      for (let yy = yy_start; yy < yy_stop; yy++) {
        let dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
        let center_x = (i + 0.5) * ratio_w;
        let w0 = dy * dy; //pre-calc part of w
        let xx_start = Math.floor(i * ratio_w);
        let xx_stop = Math.ceil((i + 1) * ratio_w);
        for (let xx = xx_start; xx < xx_stop; xx++) {
          let dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
          let w = Math.sqrt(w0 + dx * dx);
          if (w >= 1) {
            //pixel too far
            continue;
          }
          //hermite filter
          weight = 2 * w * w * w - 3 * w * w + 1;
          let pos_x = 4 * (xx + yy * width_source);
          //alpha
          gx_a += weight * data[pos_x + 3];
          weights_alpha += weight;
          //colors
          if (data[pos_x + 3] < 255) weight = (weight * data[pos_x + 3]) / 250;
          gx_r += weight * data[pos_x];
          gx_g += weight * data[pos_x + 1];
          gx_b += weight * data[pos_x + 2];
          weights += weight;
        }
      }
      data2[x2] = gx_r / weights;
      data2[x2 + 1] = gx_g / weights;
      data2[x2 + 2] = gx_b / weights;
      data2[x2 + 3] = gx_a / weights_alpha;
    }
  }

  //Ya que esta, exagerarlo. Blancos blancos y negros negros..?

  for (let p = 0; p < data2.length; p += 4) {
    let gris = data2[p]; //Esta en blanco y negro

    if (gris < 100) {
      gris = 0; //exagerarlo
    } else {
      gris = 255; //al infinito
    }

    data2[p] = gris;
    data2[p + 1] = gris;
    data2[p + 2] = gris;
  }
  ctx2.putImageData(img2, 0, 0);
}

//sec
function analyzeSequencial() {
  console.log("Analizando dibujo...");
  //Pasar canvas a version 28x28
  resizeSample(canvas, 28, 28, smallCanvas);

  let imgData = ctx2.getImageData(0, 0, 28, 28);
  let arr = []; //El arreglo completo
  let arr28 = []; //Al llegar a 28 posiciones se pone en 'arr' como un nuevo indice
  for (let p = 0, i = 0; p < imgData.data.length; p += 4) {
    let valor = imgData.data[p + 3] / 255;
    arr28.push([valor]); //Agregar al arr28 y normalizar a 0-1. Aparte queda dentro de un arreglo en el indice 0... again
    if (arr28.length == 28) {
      arr.push(arr28);
      arr28 = [];
    }
  }

  arr = [arr]; //Meter el arreglo en otro arreglo por que si no tio tensorflow se enoja >:(
  //Nah basicamente Debe estar en un arreglo nuevo en el indice 0, por ser un tensor4d en forma 1, 28, 28, 1
  let tensor4 = tf.tensor4d(arr);
  let resultados = modeloSeq.predict(tensor4).dataSync();
  let mayorIndice = resultados.indexOf(Math.max.apply(null, resultados));

  console.log("Modelo Secuencial", mayorIndice);
  description = "Secuencial: ";
  document.getElementById("numSeq").innerText = description + mayorIndice;
}

//conv
function analyzeConvulutional() {
  console.log("Analizando dibujo...");
  //Pasar canvas a version 28x28
  resizeSample(canvas, 28, 28, smallCanvas);

  let imgData = ctx2.getImageData(0, 0, 28, 28);
  let arr = []; //El arreglo completo
  let arr28 = []; //Al llegar a 28 posiciones se pone en 'arr' como un nuevo indice
  for (let p = 0, i = 0; p < imgData.data.length; p += 4) {
    let valor = imgData.data[p + 3] / 255;
    arr28.push([valor]); //Agregar al arr28 y normalizar a 0-1. Aparte queda dentro de un arreglo en el indice 0... again
    if (arr28.length == 28) {
      arr.push(arr28);
      arr28 = [];
    }
  }

  arr = [arr]; //Meter el arreglo en otro arreglo por que si no tio tensorflow se enoja >:(
  //Nah basicamente Debe estar en un arreglo nuevo en el indice 0, por ser un tensor4d en forma 1, 28, 28, 1
  let tensor4 = tf.tensor4d(arr);
  let resultados = modeloConvu.predict(tensor4).dataSync();
  let mayorIndice = resultados.indexOf(Math.max.apply(null, resultados));

  console.log("Modelo Convulucional: ", mayorIndice);
  description = "Convulucional: ";
  document.getElementById("numConv").innerText = description + mayorIndice;
}

btnSend.addEventListener("click", function () {
  analyzeSequencial();
  analyzeConvulutional();
});
(async () => {
  console.log("Cargando modelo...");
  modeloSeq = await tf.loadLayersModel("model-seq.json");
  console.log("Modelo cargado Sequential...");
  modeloConvu = await tf.loadLayersModel("model-conv.json");
  console.log("Modelo cargado Convulucional...");
})();
