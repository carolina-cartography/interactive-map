import React from 'react'
import View from '../components/View';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Initialize map outside of any function
var map;

export default class MapEditView extends View {

	constructor(props) {
		super(props)
	}

	setupMap() {
		map = L.map('leaflet', {
			scrollWheelZoom: true
		});
		L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			tms: false
		}).addTo(map)
	}

	render() {
		return (
			<React.Fragment>
				<div id="leaflet"></div>
			</React.Fragment>
		);
  	}
}