import { resizeSample } from "./resizeSample.js";

export function analyzeConvulutional(ctx2, canvas, smallCanvas) {
  resizeSample(canvas, 28, 28, smallCanvas);

  let imgData = ctx2.getImageData(0, 0, 28, 28);
  let arr = [];
  let arr28 = [];
  for (let p = 0, i = 0; p < imgData.data.length; p += 4) {
    let valor = imgData.data[p + 3] / 255;
    arr28.push([valor]);
    if (arr28.length == 28) {
      arr.push(arr28);
      arr28 = [];
    }
  }

  arr = [arr];
  let tensor4 = tf.tensor4d(arr);
  let resultados = window.modeloConvu.predict(tensor4).dataSync();
  let mayorIndice = resultados.indexOf(Math.max.apply(null, resultados));
  document.getElementById(
    "numConv"
  ).innerHTML = ` Predicción Convulucional: ${mayorIndice} `;
}
