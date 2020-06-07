import React from 'react'
import Form from './Form'

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
var map;

export default class PlaceModal extends React.Component {

	constructor(props) {
		super(props)
		this.close = this.close.bind(this)
		this.formatRequest = this.formatRequest.bind(this)
		this.onSuccess = this.onSuccess.bind(this)
	}

	componentDidMount() {
		this.setupModalMap()
	}

	componentWillUnmount() {
	}

	close() {
		this.props.close()
	}

	formatRequest(request) {
		const { newPlace, mapID } = this.props;

		const formattedRequest = {
			map: mapID,
		};
		formattedRequest.metadata = {};
		
		// Transfer existing keys to metadata
		for (var key in request) {
			if (request.hasOwnProperty(key)) {
				formattedRequest.metadata[key] = request[key];
			}
		}

		// Add coordinates & map data to request
		if (newPlace._latlng) {
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

		let coordinates;

		// Get new place or saved place coordinates
		if (newPlace._latlng) {
			if (newPlace) {
				coordinates = [newPlace._latlng.lat, newPlace._latlng.lng]
			} else if (place) {
				coordinates = place.location.coordinates;
			}
	
			// Add place to modal map
			L.marker(coordinates).addTo(map)
	
			// Position map
			map.setView(coordinates, 15);

		} else if (newPlace._latlngs) {
			coordinates = [];
			for (let ll of newPlace._latlngs[0]) {
				coordinates.push([ll.lat, ll.lng])
			}

			const polygon = L.polygon(coordinates, {color: 'red'}).addTo(map)
			map.fitBounds(polygon.getBounds())
		}

		// Add background layer at front on load
		L.tileLayer('https://cartocollective.blob.core.windows.net/vieques/1983/{z}/{x}/{y}.png', {
			tms: true
		}).addTo(map).bringToFront();
	}

	render() {
		const { newPlace, place } = this.props;
		return (
			<div className="modal-container">
				<div className="underlay" onClick={this.close}></div>
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