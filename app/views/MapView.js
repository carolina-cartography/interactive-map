import React from 'react'
import View from './../components/View';
import Authentication from './../tools/Authentication';
import Requests from './../tools/Requests';
import PlaceModal from './../components/PlaceModal';
import MapAdminPanel from '../components/MapAdminPanel';
import { PreparePolygonForLeaftlet } from '../tools/Helpers';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Initialize map outside of any function
var map;

export default class MapView extends View {

	constructor(props) {
		super(props)
		this.getMap = this.getMap.bind(this)
		this.setupMap = this.setupMap.bind(this)
		this.setupAuthenticatedMap = this.setupAuthenticatedMap.bind(this)
		this.addPlaceToMap = this.addPlaceToMap.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.layerEdit = this.layerEdit.bind(this)
	}

	state = {
		isAdmin: Authentication.isAdmin(),
		status: null,
		map: null,
		selectedPlace: null,
	}

	componentDidMount() {
		this.getMap().then(() => {
			this.setupMap()
			this.setupAuthenticatedMap()
		})
	}

	getMap() {
		return new Promise((resolve, reject) => {
			this.setState({ status: "Loading map..." })
			Requests.do("map.get", {
				id: this.props.match.params.id,
			}).then((response) => {
				this.setState({ status: null, map: response.map }, resolve)
			}).catch((response) => {
				this.setState({ status: `Error: ${response.message}` }, reject)
			})
		})
	}

	setupMap() {
		// Initialize map
		map = L.map('leaflet', {
			scrollWheelZoom: true
		});

		// Position map
		map.setView(this.state.map.coordinates, this.state.map.zoom);

		// Add tiles
		L.tileLayer(this.state.map.tiles, {
			tms: this.state.map.tmsTiles
		}).addTo(map);

		// Load places from database
		this.setState({ status: "Loading places..." })
		Requests.do('place.get', {
			map: this.state.map.guid,
		}).then((response) => {
			this.setState({ status: null })
			for (let i in response.places) {
				this.addPlaceToMap(response.places[i])				
			}
		}).catch((response) => {
			this.setState({ status: `Error: ${response.message}` });
		});
	}

	setupAuthenticatedMap() {
		if (!Authentication.isAuthenticated()) return;

		map.pm.addControls({
			position: 'topleft',
			drawMarker: true,
			drawCircleMarker: false,
			drawPolyline: false,
			drawRectangle: false,
			drawPolygon: true,
			drawCircle: true,
			editMode: false,
			dragMode: false, 
			cutPolygon: false,
			removalMode: false,
		});

		map.on("pm:create", e => {
			this.setState({ selectedPlace: e.layer });
		})
	}

	addPlaceToMap(place) {
		let leafletPlace
		if (place.radius) {
			leafletPlace = L.circle(place.location.coordinates, { 
				dbPlace: place,
				radius: place.radius,
			})
		} else if (place.location.type == "Point") {
			leafletPlace = L.marker(place.location.coordinates, { 
				dbPlace: place
			})
		} else if (place.location.type == "Polygon") {
			PreparePolygonForLeaftlet(place)
			leafletPlace = L.polygon(place.location.coordinates, { 
				dbPlace: place
			})
		}
		
		leafletPlace.on('click', e => {
			if (this.editMode) this.stopLayerEdit(e)
			else this.setState({ selectedPlace: e.target })
		})

		leafletPlace.addTo(map);
	}

	closeModal(dbPlace, remove) {
		const { selectedPlace } = this.state;

		// Remove the original place if specified
		if (remove) map.removeLayer(selectedPlace)

		// If the place was saved, re-add with latest database place object
		if (dbPlace) this.addPlaceToMap(dbPlace)
		
		// Reset selectedPlace
		this.setState({ selectedPlace: null });
	}

	layerEdit() {
		const { selectedPlace } = this.state
		selectedPlace.pm.enable()
		this.editMode = true;
		this.setState({ selectedPlace: null, status: 'Drag the place to change position. Click the place to finish.' })
	}

	stopLayerEdit(e) {
		e.target.options.edited = true;
		this.setState({ selectedPlace: e.target, status: null })
		this.editMode = false
	}

	render() {
		const { 
			isAdmin, map, status, selectedPlace,
		} = this.state;

		return (
			<div className="map-view">
				{status && 
					<div className="status">{status}</div>}
				{map && 
					<div id="leaflet"></div>}
				{map && isAdmin && 
					<MapAdminPanel map={map} history={this.props.history} />}
				{selectedPlace && <PlaceModal
					map={this.state.map}
					place={selectedPlace}
					close={this.closeModal}
					layerEdit={this.layerEdit}
				/>}
			</div>
		);
  	}
}