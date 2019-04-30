import FFT from "./FFT";

export function inputReals(size) {
  var result = new Float32Array(size);
  for (var i = 0; i < result.length; i++) result[i] = (i % 2) / 4.0;
  return result;
}

export function zeroReals(size) {
  var result = new Float32Array(size);
  for (var i = 0; i < result.length; i++) result[i] = 0.0;
  return result;
}

export function singleSidedSpectraRMS(signal, N, fs) {
  const imag = FFT.arrayOfZeros(N.length);
  const data = {};
  for (var i = 0; i < N.length; i++) {
    const NFFT = N[i];
    const Y = FFT.transform(signal, imag);
    // const df = fs / NFFT;
    // const fvec = FFT.arrayOfZeros(Y.real.length);
    // for (var j = 0; j < Y.length; j++) {
    //   fvec[j] = j * df;
    // }
    // const amp = Y.real.map(d => d / Math.sqrt(2));
    const ampSingle = Y.real.slice(2, NFFT / 2);
    data[i] = ampSingle;
  }
  return data;
}
