import React from 'react'
import View from './../components/View';
import Authentication from './../tools/Authentication';
import Requests from './../tools/Requests';
import PlaceModal from './../components/PlaceModal';

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
		this.closeModal = this.closeModal.bind(this)
		this.setupMap = this.setupMap.bind(this)
		this.setupAuthenticatedMap = this.setupAuthenticatedMap.bind(this)
		this.loadPlaces = this.loadPlaces.bind(this)
		this.delete = this.delete.bind(this)
		this.edit = this.edit.bind(this)
		this.addPlaceToMap = this.addPlaceToMap.bind(this)
		this.deletePlaceFromMap = this.deletePlaceFromMap.bind(this)
	}

	state = {
		isAdmin: Authentication.isAdmin(),
		loading: false,
		map: null,
		selectedPlace: null,
		newPlace: null,
		error: null,
		deleting: false,
		deleteError: null,
	}

	componentDidMount() {
		this.getMap().then(() => {
			this.setupMap()
			this.loadPlaces()
			this.setupAuthenticatedMap()
		})
	}

	getMap() {
		return new Promise((resolve, reject) => {
			this.setState({ loading: true })
			Requests.do("map.get", {
				id: this.props.match.params.id,
			}).then((response) => {
				this.setState({ loading: false, map: response.map }, resolve)
			}).catch((response) => {
				this.setState({ loading: false, error: response.message }, reject)
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
			drawPolygon: true,
			drawCircle: true,
			editMode: false,
			dragMode: false, 
			cutPolygon: false,
			removalMode: false,
		});

		// When a marker is created...
		map.on("pm:create", e => {

			// Add 'newPlace' to state, which triggers modal
			this.setState({ newPlace: e.layer });
		})
	}

	addPlaceToMap(place) {

		// Setup a Leaflet object for a place or polygon
		let leafletPlace
		if (place.radius) {
			leafletPlace = L.circle(place.location.coordinates, { radius: place.radius, place })
		} else if (place.location.type == "Point") {
			leafletPlace = L.marker(place.location.coordinates, { place })
		} else if (place.location.type == "Polygon") {
			// Remove duplicate point at end of polygon arrays, invert lat/lngs from GeoJSON
			place.location.coordinates.forEach(pointList => {
				pointList.pop()
				pointList.forEach((latLng, index) => {
					let inverted = [latLng[1], latLng[0]]
					pointList[index] = inverted
				})
			}) 
			leafletPlace = L.polygon(place.location.coordinates, { place })
		}
		
		// On place click, add 'selectedPlace' to state, which triggers modal
		leafletPlace.on('click', (e) => {
			this.setState({ selectedPlace: e.target.options.place });
		})

		// Add place to map
		leafletPlace.addTo(map);
	}

	deletePlaceFromMap(place) {
		map.eachLayer(layer => {
			if (layer.options && layer.options.place && layer.options.place.guid == place.guid) {
				map.removeLayer(layer)
			} 
		})
	}

	loadPlaces() {
		// Get this map's places from the database
		Requests.do('place.get', {
			map: this.state.map.guid,
		}).then((response) => {

			// For every place returned by database...
			for (let i in response.places) {
				this.addPlaceToMap(response.places[i])				
			}
		}).catch((err) => {});
	}

	closeModal(place, toDelete) {
		const { newPlace } = this.state;

		// If modal was opened for a new place...
		if (newPlace) {

			// Remove the original place
			map.removeLayer(newPlace)

			// If the place was saved, re-add with database place object
			if (place) this.addPlaceToMap(place)
		}

		// If modal was closed by delete function...
		if (toDelete) this.deletePlaceFromMap(place)
		
		// Create state
		this.setState({ selectedPlace: null, newPlace: null });
	}

	delete() {
		const { map } = this.state;
		this.setState({ deleting: true });
		Requests.do("map.delete", {
			guid: map.guid,
		}).then(response => {
			this.props.history.push("/maps")
		}).catch(response => {
			this.setState({ deleting: false, deleteError: response.message });
		})
	}

	edit() {
		const { map } = this.state;
		this.props.history.push(`/map/${map.id}/edit`);
	}

	render() {
		const { 
			isAdmin, map, loading, error, selectedPlace, newPlace,
			deleting, deleteError,
		} = this.state;

		// Determine whether to show modal
		let showModal = false;
		if (selectedPlace || newPlace) {
			showModal = true;
		}

		return (
			<div className="map-view">
				{loading || error && <div className="status">
					{loading && "Loading..."}
					{error && `Error: ${error}`}
				</div>}
				{map && <div id="leaflet"></div>}
				{map && isAdmin && <div className="admin-panel">
					<span onClick={this.delete}>
						{deleting
							? "Deleting..."
							: "Delete"}
					</span>
					<span onClick={this.edit}>{"Edit"}</span>
					{deleteError && <div className="admin-error">
						{`Delete failed: ${deleteError}`}
					</div>}
				</div>}
				{showModal && <PlaceModal
					mapGUID={this.state.map.guid}
					place={selectedPlace}
					newPlace={newPlace}
					close={this.closeModal}
					tiles={this.state.map.tiles}
					tmsTiles={this.state.map.tmsTiles}
				/>}
			</div>
		);
  	}
}