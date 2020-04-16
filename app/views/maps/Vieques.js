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
		const user = Authentication.getUser();

		// If user doesn't exist (no one logged in), don't finish function
		if (!user) return;

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
			// Make a place.create call using coordinates and user
			Requests.do('place.create', {
				user: user.guid,
				map: MAP_ID,
				coordinates: [e.marker._latlng.lat, e.marker._latlng.lng],
			}).then((response) => {
				// Handle response here
			}).catch((err) => {
				// Handle error here
			})
		})
	}

	loadPlaces() {
		return Requests.do('place.get', {
			map: MAP_ID,
		}).then((response) => {
			var places = response.places;
			for (var i in places) {
				var place = places[i];
				var marker = L.marker(place.location.coordinates, { place });
				marker.on('click', (e) => {
					this.setState({ selectedPlace: e.target.options.place });
				})
				marker.addTo(map);
			}
		}).catch((err) => {
			console.log('Error getting places...')
			console.log(err);
		})
	}

	closeModal() {
		this.setState({ selectedPlace: null });
	}

	render() {
		const { selectedPlace } = this.state;
		return (
			<React.Fragment>
				<div id="leaflet"></div>
				{selectedPlace && <PlaceModal 
					place={selectedPlace}
					close={this.closeModal}
				/>}
			</React.Fragment>
		);
  	}
}