//sec
export function analyzeSequencial(ctx2, canvas, smallCanvas) {
  resample_single(canvas, 28, 28, smallCanvas);

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
  let resultados = modeloSeq.predict(tensor4).dataSync();
  let mayorIndice = resultados.indexOf(Math.max.apply(null, resultados));

  console.log("Prediccion Secuencial", mayorIndice);
  description = "Predicción Secuencial: ";
  document.getElementById("numSeq").innerText = description + mayorIndice;
}
