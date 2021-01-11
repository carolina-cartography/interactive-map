import React from 'react'
import Form from './Form'
import Authentication from './../tools/Authentication'
import Requests from './../tools/Requests'

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
var map;

export default class PlaceModal extends React.Component {

	constructor(props) {
		super(props)
		this.formatRequest = this.formatRequest.bind(this)
		this.onSuccess = this.onSuccess.bind(this)
		this.delete = this.delete.bind(this)
		this.edit = this.edit.bind(this)
		this.overlayClick = this.overlayClick.bind(this)
	}

	state = {
		isAdmin: Authentication.isAdmin(),
		editMode: false,
		deleting: false,
		deleteError: null,
	}

	componentDidMount() {
		this.setupModalMap()
	}

	formatRequest(request) {
		const { newPlace, mapGUID } = this.props;

		const formattedRequest = {
			map: mapGUID,
		};
		formattedRequest.metadata = {};
		
		// Transfer existing keys to metadata
		for (var key in request) {
			if (request.hasOwnProperty(key)) {
				formattedRequest.metadata[key] = request[key];
			}
		}

		// Add coordinates & map data to request
		if (newPlace._mRadius) {
			formattedRequest.type = "circle"
			formattedRequest.coordinates = [
				newPlace._latlng.lat,
				newPlace._latlng.lng
			];
			formattedRequest.radius = newPlace._mRadius
		} else if (newPlace._latlng) {
			formattedRequest.type = "point"
			formattedRequest.coordinates = [
				newPlace._latlng.lat,
				newPlace._latlng.lng
			];
		} else if (newPlace._latlngs) {
			formattedRequest.type = "polygon"
			let geojson = newPlace.toGeoJSON()
			formattedRequest.coordinates = geojson.geometry.coordinates;
		}
		
		return formattedRequest
	}

	onSuccess(response) {
		this.props.close(response.place);
	}

	setupModalMap() {
		const { newPlace, place } = this.props;

		// Initialize map
		map = L.map('modalMap', {
			scrollWheelZoom: true
		});

		// Get new place or saved place coordinates
		let pointCoordinates, polygonCoordinates, circleRadius
		if (newPlace) {
			if (newPlace._latlng && newPlace._mRadius) {
				pointCoordinates = newPlace._latlng
				circleRadius = newPlace._mRadius
			} else if (newPlace._latlng) {
				pointCoordinates = newPlace._latlng
			} else if (newPlace._latlngs) {
				polygonCoordinates = newPlace._latlngs
			}
		} else if (place) {
			if (place.radius) {
				pointCoordinates = place.location.coordinates
				circleRadius = place.radius
			} else if (place.location.type == "Point") {
				pointCoordinates = place.location.coordinates
			} else if (place.location.type == "Polygon") {
				polygonCoordinates = place.location.coordinates
			}
		}

		if (circleRadius) {
			let circle = L.circle(pointCoordinates, { radius: circleRadius }).addTo(map)
			// Note: circle.getBounds is throwing an exception here
			// Come back and fix this later
			map.setView(circle.getLatLng(), 10)
		} else if (pointCoordinates) {
			let point = L.marker(pointCoordinates).addTo(map)
			map.setView(point.getLatLng(), 15);
		} else if (polygonCoordinates) {
			let polygon = L.polygon(polygonCoordinates).addTo(map)
			map.fitBounds(polygon.getBounds())
		}

		// Add background layer at front on load
		L.tileLayer(this.props.tiles, {
			tms: this.props.tmsTiles,
		}).addTo(map).bringToFront();
	}

	delete() {
		const { place } = this.props;
		this.setState({ deleting: true });
		Requests.do("place.delete", {
			guid: place.guid,
		}).then(() => {
			this.props.close(place, true)
		}).catch(response => {
			this.setState({ deleting: false, deleteError: response.message });
		})
	}

	edit() {
		this.setState({ editMode: true })
	}

	overlayClick(event) {
		this.props.close()
	}

	render() {
		const { newPlace, place } = this.props;
		const { isAdmin, deleting, deleteError } = this.state;
		return (
			<div className="modal-container">
				<div className="underlay" onClick={this.overlayClick}></div>
				<div className="modal">
					<div id="modalMap"></div>
					{newPlace && <React.Fragment>
						<Form
							endpoint="place.create"
							fields={{
								title: { type: 'text', title: 'Title', required: true },
								description: { type: 'textarea', title: 'Description', rows: 4 }
							}}
							formatRequest={this.formatRequest}
							onSuccess={this.onSuccess}
						/>
					</React.Fragment>}
					{place && <div className="info">
						{isAdmin && <div className="admin-panel">
							<span onClick={this.delete}>
								{deleting
									? "Deleting..."
									: "Delete"}
							</span>
							{/* <span onClick={this.edit}>{"Edit"}</span> */}
							{deleteError && <div className="admin-error">
								{`Delete failed: ${deleteError}`}
							</div>}
						</div>}
						{place.metadata
							? <div className='metadata'>
								{place.metadata.title
									? <h1>{place.metadata.title}</h1>
									: null}
								{place.metadata.description
									? <p>{place.metadata.description}</p>
									: null}
							</div>
							: null
						}
						{`Created by: ${place.userName}`}
					</div>}
				</div>
			</div>
		);
  	}
}