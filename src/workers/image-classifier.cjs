const { parentPort, workerData } = require('worker_threads');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

function decodeImage(imageBuffer, mimeType) {
    let pixelData;
    let width, height;

    try {
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
            const decoded = jpeg.decode(imageBuffer, { useTArray: true });
            pixelData = decoded.data;
            width = decoded.width;
            height = decoded.height;
        } else if (mimeType === 'image/png') {
            const decoded = PNG.sync.read(imageBuffer);
            pixelData = decoded.data;
            width = decoded.width;
            height = decoded.height;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Worker: Erro ao decodificar imagem:", error);
        return null;
    }

    const numChannels = 3;
    const numPixels = width * height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
        for (let c = 0; c < numChannels; c++) {
            values[i * numChannels + c] = pixelData[i * 4 + c];
        }
    }

    return tf.tensor3d(values, [height, width, numChannels], 'int32');
}

async function runAnalysis() {
    try {
        // Define o backend como CPU para evitar erros de DLL no Windows e compatibilidade
        await tf.setBackend('cpu');

        const model = await cocoSsd.load();

        const { fileBuffer, mimeType } = workerData;
        
        // Reconstrói o buffer (ele é transferido como Uint8Array)
        const buffer = Buffer.from(fileBuffer);

        const imageTensor = decodeImage(buffer, mimeType);

        if (!imageTensor) {
            parentPort.postMessage([]);
            return;
        }

        const predictions = await model.detect(imageTensor);
        
        const tags = predictions.map(pred => pred.class.toLowerCase());

        imageTensor.dispose();

        parentPort.postMessage(tags);

    } catch (error) {
        console.error("Worker: Erro fatal na análise:", error);
        parentPort.postMessage([]); 
    }
}

runAnalysis();