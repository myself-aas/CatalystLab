import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',
  entry: './lib/firebase.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'firebase-bundle.js',
    library: 'CatalystFirebase',
    libraryTarget: 'window'
  }
};
