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

export default class MapView extends View {

	constructor(props) {
		super(props)
		this.closeModal = this.closeModal.bind(this)
		this.setupMap = this.setupMap.bind(this)
		this.setupAuthenticatedMap = this.setupAuthenticatedMap.bind(this)
		this.loadPlaces = this.loadPlaces.bind(this)
	}

	state = {
		selectedPlace: null,
		newPlace: null,
	}

	componentDidMount() {
		this.setupMap()
		this.loadPlaces()
		this.setupAuthenticatedMap()
	}

	setupMap() {
		// Initialize map
		map = L.map('leaflet', {
			scrollWheelZoom: true
		});

		// Position map
		map.setView([18.14, -65.43], 12);

		// Add background layer at front on load
		L.tileLayer('https://cartocollective.blob.core.windows.net/vieques/1983/{z}/{x}/{y}.png', {
			tms: true
		}).addTo(map).bringToFront();
	}

	setupAuthenticatedMap() {
		if (!Authentication.isAuthenticated()) return;

		// Add supported controls
		map.pm.addControls({
			position: 'topleft',
			drawMarker: true,
			drawCircleMarker: false,
			drawPolyline: false,
			drawRectangle: false,
			drawPolygon: false,
			drawCircle: false,
			editMode: false,
			dragMode: false, 
			cutPolygon: false,
			removalMode: false,
		});

		// When a marker is created...
		map.on("pm:create", e => {

			// Add 'newPlace' to state, which triggers modal
			this.setState({ newPlace: e.marker });

			console.log(e)
		})
	}

	loadPlaces() {

		// Get this map's places from the database
		Requests.do('place.get', {
			map: MAP_ID,
		}).then((response) => {

			// For every place returned by database...
			for (var i in response.places) {
				var place = response.places[i];

				// Setup a marker...
				var marker = L.marker(place.location.coordinates, { place });

				// On marker click, add 'selectedPlace' to state, which triggers modal
				marker.on('click', (e) => {
					this.setState({ selectedPlace: e.target.options.place });
				})

				// Add marker to map
				marker.addTo(map);
			}
		}).catch((err) => {});
	}

	closeModal(place) {
		const { newPlace } = this.state;

		// If modal was opened for a new place...
		if (newPlace) {

			// Remove the original place
			map.removeLayer(newPlace)

			// If the place was saved, re-add with database place object
			if (place) {
				var marker = L.marker(newPlace._latlng, { place });
				marker.on('click', (e) => {
					this.setState({ selectedPlace: e.target.options.place });
				})
				marker.addTo(map)
			}
		}
		
		// Create state
		this.setState({ selectedPlace: null, newPlace: null });
	}

	render() {
		const { selectedPlace, newPlace } = this.state;

		// Determine whether to show modal
		let showModal = false;
		if (selectedPlace || newPlace) {
			showModal = true;
		}

		return (
			<React.Fragment>
				<div id="leaflet"></div>
				{showModal && <PlaceModal
					mapID={MAP_ID}
					place={selectedPlace}
					newPlace={newPlace}
					close={this.closeModal}
				/>}
			</React.Fragment>
		);
  	}
}