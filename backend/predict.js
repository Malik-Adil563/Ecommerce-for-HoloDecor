// predict.js
const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
  const model = await tf.loadGraphModel('file://path/to/tfjs_wall_model/model.json');
  console.log("Model loaded successfully!");
}

loadModel();
