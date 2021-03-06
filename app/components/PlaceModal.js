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
		this.editMetadata = this.editMetadata.bind(this)
		this.overlayClick = this.overlayClick.bind(this)
	}

	state = {
		user: Authentication.getUser(),
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
		const { dbPlace } = place.options;

		const formattedRequest = {};
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

		if (dbPlace) {
			formattedRequest.guid = dbPlace.guid
		} else {
			formattedRequest.map = map.guid
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
		const { dbPlace } = place.options;
		this.setState({ deleting: true });
		Requests.do("place.delete", {
			guid: dbPlace.guid,
		}).then(() => {
			this.props.close(null, true)
		}).catch(response => {
			this.setState({ deleting: false, deleteError: response.message });
		})
	}

	editMetadata() {
		this.setState({ editMode: true })
	}

	overlayClick() {
		this.props.close()
	}

	render() {
		const { place } = this.props;
		const { dbPlace, edited } = place.options;
		const { user, editMode, deleting, deleteError } = this.state;

		let canEdit = Authentication.isAdmin() || (dbPlace && user && user.guid === dbPlace.user);

		let endpoint = "place.create"
		let fields = {
			title: { type: 'text', title: 'Title', required: true },
			description: { type: 'textarea', title: 'Description', rows: 4 }
		}
		if (dbPlace) {
			endpoint = "place.edit"
			fields.title.value = dbPlace.metadata.title
			fields.description.value = dbPlace.metadata.description
		}

		let showForm = !dbPlace || editMode || edited;
		let showInfo = dbPlace && !editMode && !edited;

		return (
			<div className="modal-container">
				<div className="underlay" onClick={this.overlayClick}></div>
				<div className="modal">
					<div id="modalMap"></div>
					{showForm && <React.Fragment>
						<Form
							endpoint={endpoint}
							fields={fields}
							formatRequest={this.formatRequest}
							onSuccess={response => {
								this.props.close(response.place, true)
							}}
							buttonText="Save"
						/>
					</React.Fragment>}
					{showInfo && <div className="info">
						{dbPlace.metadata && <div className='metadata'>
							{dbPlace.metadata.title
								? <h1>{dbPlace.metadata.title}</h1>
								: null}
							{dbPlace.metadata.description
								? <p>{dbPlace.metadata.description}</p>
								: null}
							{`Created by: ${dbPlace.userName}`}
						</div>}
					</div>}
					{showInfo && canEdit && <div className="admin-panel">
						<span onClick={this.delete}>
							{deleting
								? "Deleting..."
								: "Delete"}
						</span>
						<span onClick={this.editMetadata}>{"Edit metadata"}</span>
						<span onClick={this.props.layerEdit}>{"Edit position"}</span>
						{deleteError && <div className="admin-error">
							{`Delete failed: ${deleteError}`}
						</div>}
					</div>}
				</div>
			</div>
		);
  	}
}