import { resizeSample } from "./resizeSample.js";

//sec
export function analyzeSequencial(ctx2, canvas, smallCanvas) {
  resizeSample(canvas, 28, 28, smallCanvas);

  let imgData = ctx2.getImageData(0, 0, 28, 28);
  let arr = [];
  let arr28 = [];
  for (let p = 0, i = 0; p < imgData.data.length; p += 4) {
    let val = imgData.data[p + 3] / 255;
    arr28.push([val]);
    if (arr28.length == 28) {
      arr.push(arr28);
      arr28 = [];
    }
  }

  arr = [arr];
  let tensor4 = tf.tensor4d(arr);
  let resultados = window.modeloSeq.predict(tensor4).dataSync();
  let mayorIndice = resultados.indexOf(Math.max.apply(null, resultados));

  document.getElementById(
    "numSeq"
  ).innerHTML = ` Predicción secuencial: ${mayorIndice} `;
}
