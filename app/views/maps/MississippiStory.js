import React from 'react'
import View from './../../components/View';
import Authentication from './../../tools/Authentication';
import Requests from './../../tools/Requests';
import PlaceModal from './../../components/PlaceModal';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Setup Vieques map
const MAP_ID = 'vieques';

// Initialize map outside of any function
var map;

var events = {
	'31': {place: [44.9506, -93.3423], zoom: 17},
	'80': {place: [44.9584, -93.3227], zoom: 16},
}

export default class MapView extends View {

	constructor(props) {
		super(props)
		this.setupMap = this.setupMap.bind(this)
	}

	componentDidMount() {
		this.setupMap()
		this.setupAudio()
	}

	setupMap() {
		// Initialize map
		map = L.map('leaflet', {
			scrollWheelZoom: true
		});

		// Position map
		map.setView([44.9737, -93.2665], 15);

		// Add background layer at front on load
		L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			tms: false
		}).addTo(map).bringToFront();

		map.on("moveend", event => {
			console.log(map.getCenter())
			console.log(map.getZoom())
		})
	}

	setupAudio() {
		let player = document.getElementById("audioPlayer")
		let interval
		player.onplay = (event) => {
			interval = setInterval(() => {
				let thisSecond = parseInt(player.currentTime).toString();
				let now = events[thisSecond]
				if (now !== undefined) {
					map.flyTo(now.place, now.zoom)
				}
			}, 1000)
		}
		player.onpause = event => {
			if (interval) clearInterval(interval)
		}
	}

	render() {
		return (
			<div className="map-view">
				<div id="leaflet"></div>
				<audio id="audioPlayer" controls>
					<source src="/assets/MississippiTourDemo.mp3" type="audio/mpeg" />
					Your browser does not support the audio element.
				</audio>
			</div>
		);
  	}
}