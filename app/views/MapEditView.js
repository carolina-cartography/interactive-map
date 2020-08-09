import React from 'react'
import View from '../components/View';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import Form from '../components/Form';

// Initialize map outside of any function
var map;

export default class MapEditView extends View {

	constructor(props) {
		super(props)
		this.onSuccess = this.onSuccess.bind(this)
	}

	componentDidMount() {
		this.setupMap()
	}

	setupMap() {
		map = L.map('leaflet', {
			scrollWheelZoom: false
		});
		map.setView([8.78, 34.50], 2)
		L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			tms: false
		}).addTo(map)
	}

	formatRequest(request) {
		let formattedRequest = request
		formattedRequest.coordinates = [map.getCenter().lat, map.getCenter().lng]
		formattedRequest.zoom = map.getZoom()
		return formattedRequest
	}

	onSuccess(response) {
		this.props.history.push(`/map/${response.map.id}`)
	}

	render() {
		return (
			<React.Fragment>
				<div className="container view">
					<h1>{"Create a new map"}</h1>
					<div className="map-edit-container">
						{"Select the default position for your map:"}
						<div id="leaflet"></div>
					</div>
					<Form 
						endpoint={'map.create'}
						fields={{
							name: { type: 'text', title: 'Name' },
							id: { type: 'text', title: 'ID (used for this map\'s URL)'},
							description: { type: 'textarea', title: 'Description' },
							tiles: { type: 'text', title: "Tiles URL (URL including {z}/{x}/{y})", 
								placeholder: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" },
						}} 
						formatRequest={this.formatRequest}
						onSuccess={this.onSuccess}
					/>
				</div>
			</React.Fragment>
		);
  	}
}