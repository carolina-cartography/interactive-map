// Import dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Import SCSS
import './scss/app.scss';

// Import images
import 'leaflet/dist/images/layers.png';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';

// Import App
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));