import React from 'react'
import View from './../../components/View';
import Authentication from './../../tools/Authentication';
import Requests from './../../tools/Requests';
import PlaceModal from './../../components/PlaceModal';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Initialize map outside of any function
var map;

export default class MapView extends View {

	constructor(props) {
		super(props)
		this.closeModal = this.closeModal.bind(this);
	}

	state = {
		selectedLeafletPlace: null,
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
				// Requests.do('place.create', {
				// 	latitude: e.marker.
				// })

				// this.setState({selectedLeafletPlace: e})
			})
		}
	}

	closeModal() {
		this.setState({ selectedLeafletPlace: null });
	}

	render() {
		const { selectedLeafletPlace } = this.state;
		return (
			<React.Fragment>
				<div id="leaflet"></div>
				{selectedLeafletPlace && <PlaceModal 
					leafletPlace={selectedLeafletPlace}
					close={this.closeModal}
				/>}
			</React.Fragment>
		);
  	}
}