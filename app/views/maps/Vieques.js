import React from 'react'
import View from './../../components/View';
import Authentication from './../../tools/Authentication';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Initialize map outside of any function
var map;

export default class MapView extends View {

	constructor(props) {
		super(props)
	}

	componentDidMount() {
		let isAuthenticated = Authentication.isAuthenticated();

		// Initialize map
		map = L.map('leaflet', {
			scrollWheelZoom: true
		});

		// Position map for Vieques
		map.setView([18.14, -65.43], 12);

		// Add background layer at front on load
		L.tileLayer('https://cartocollective.blob.core.windows.net/vieques/1983/{z}/{x}/{y}.png', {
			tms: true
		}).addTo(map).bringToFront();

		// Add Geoman controls if authenticated
		if (isAuthenticated) {
			map.pm.addControls({
				position: 'topleft',
				drawCircle: false,
			});
		}
	}

	render() {
		return <div id="leaflet"></div>;
  	}
}