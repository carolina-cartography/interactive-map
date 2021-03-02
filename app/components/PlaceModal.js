import React from 'react'
import Form from './Form'
import Authentication from './../tools/Authentication'
import Requests from './../tools/Requests'

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
var modalMap;

export default class PlaceModal extends React.Component {

	constructor(props) {
		super(props)
		this.formatRequest = this.formatRequest.bind(this)
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

	// Called by form with submit is pressed
	formatRequest(request) {
		const { place, map } = this.props;

		const formattedRequest = {
			map: map.guid,
		};
		formattedRequest.metadata = {};
		
		// Form fills request with field data, transfer this to metadata
		for (var key in request) {
			if (request.hasOwnProperty(key)) {
				formattedRequest.metadata[key] = request[key];
			}
		}

		// Add coordinates data to request
		if (place._mRadius) {
			formattedRequest.type = "circle"
			formattedRequest.coordinates = [
				place._latlng.lat,
				place._latlng.lng
			];
			formattedRequest.radius = place._mRadius
		} else if (place._latlng) {
			formattedRequest.type = "point"
			formattedRequest.coordinates = [
				place._latlng.lat,
				place._latlng.lng
			];
		} else if (place._latlngs) {
			formattedRequest.type = "polygon"
			let geojson = place.toGeoJSON()
			formattedRequest.coordinates = geojson.geometry.coordinates;
		}
		
		return formattedRequest
	}

	setupModalMap() {
		const { place, map } = this.props;

		// Initialize map
		modalMap = L.map('modalMap', {
			scrollWheelZoom: true
		});

		// Add background layer at front on load
		L.tileLayer(map.tiles, {
			tms: map.tmsTiles,
		}).addTo(modalMap).bringToFront();

		// Add place to map, zoom on place
		if (place._mRadius) {
			L.circle(place._latlng, { radius: place._mRadius }).addTo(modalMap)
			modalMap.fitBounds(place.getBounds())
		} else if (place._latlngs) {
			L.polygon(place._latlngs).addTo(modalMap)
			modalMap.fitBounds(place.getBounds())
		} else {
			L.marker(place._latlng).addTo(modalMap)
			modalMap.setView(place.getLatLng(), 15);
		}
	}

	delete() {
		const { place } = this.props;
		this.setState({ deleting: true });
		Requests.do("place.delete", {
			guid: place.options.dbPlace.guid,
		}).then(() => {
			this.props.close(place, true)
		}).catch(response => {
			this.setState({ deleting: false, deleteError: response.message });
		})
	}

	edit() {
		this.setState({ editMode: true })
	}

	overlayClick() {
		this.props.close()
	}

	render() {
		const { place } = this.props;
		const { isAdmin, deleting, deleteError } = this.state;
		return (
			<div className="modal-container">
				<div className="underlay" onClick={this.overlayClick}></div>
				<div className="modal">
					<div id="modalMap"></div>
					{place.options.newPlace && <React.Fragment>
						<Form
							endpoint="place.create"
							fields={{
								title: { type: 'text', title: 'Title', required: true },
								description: { type: 'textarea', title: 'Description', rows: 4 }
							}}
							formatRequest={this.formatRequest}
							onSuccess={response => {
								this.props.close(response.place)
							}}
						/>
					</React.Fragment>}
					{place.options.dbPlace && <div className="info">
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
						{place.options.dbPlace.metadata
							? <div className='metadata'>
								{place.options.dbPlace.metadata.title
									? <h1>{place.options.dbPlace.metadata.title}</h1>
									: null}
								{place.options.dbPlace.metadata.description
									? <p>{place.options.dbPlace.metadata.description}</p>
									: null}
							</div>
							: null
						}
						{`Created by: ${place.options.dbPlace.userName}`}
					</div>}
				</div>
			</div>
		);
  	}
}