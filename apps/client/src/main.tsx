import { render } from 'preact';
import { App } from './app.js';
import './styles.css';

const contenedor = document.getElementById('app');

if (!contenedor) {
  throw new Error('No se encontró el contenedor #app');
}

render(<App />, contenedor);
