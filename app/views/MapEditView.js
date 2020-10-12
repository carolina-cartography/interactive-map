import React from 'react'
import View from '../components/View';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import Form from '../components/Form';
import Requests from '../tools/Requests';

// Initialize map outside of any function
var map;
var mapObject
const fields = {
	name: { type: 'text', title: 'Name' },
	id: { type: 'text', title: 'ID (used for this map\'s URL)'},
	description: { type: 'textarea', title: 'Description' },
	tiles: { 
		type: 'text', 
		title: "Tiles URL (URL including {z}/{x}/{y})", 
		placeholder: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
	},
	tmsTiles: { type: 'checkbox', title: 'TMS Tiles' },
}

export default class MapEditView extends View {

	constructor(props) {
		super(props)
		this.onSuccess = this.onSuccess.bind(this)
		this.setupEditView = this.setupEditView.bind(this)
	}

	state = {
		endpoint: '',
		fields: null,
	}

	componentDidMount() {
		this.setupMap()
		if (this.props.match.params.id) this.setupEditView()
		else this.setupCreateView();
	}

	setupEditView() {
		this.setState({ loading: true })
		Requests.do("map.get", {
			id: this.props.match.params.id,
		}).then((response) => {
			mapObject = response.map

			// Populate saved fields
			fields.id.value = mapObject.id
			fields.name.value = mapObject.name
			fields.description.value = mapObject.description
			fields.tiles.value = mapObject.tiles

			// Set map center
			map.setView(mapObject.coordinates, mapObject.zoom)

			this.setState({ fieldsSet: true, endpoint: 'map.edit', loading: false })
		}).catch((response) => {
			this.setState({ loading: false, error: response.message })
		})
	}

	setupCreateView() {
		this.setState({ fieldsSet: true, endpoint: 'map.create' })
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

		if (mapObject) {
			formattedRequest.guid = mapObject.guid
		}

		return formattedRequest
	}

	onSuccess(response) {
		this.props.history.push(`/map/${response.map.id}`)
	}

	render() {
		const { fieldsSet, endpoint } = this.state;
		return (
			<React.Fragment>
				<div className="container view">
					<h1>{"Create a new map"}</h1>
					<div className="map-edit-container">
						{"Select the default position for your map:"}
						<div id="leaflet"></div>
					</div>
					{fieldsSet && <Form 
						endpoint={endpoint}
						fields={fields} 
						formatRequest={this.formatRequest}
						onSuccess={this.onSuccess}
					/>}
				</div>
			</React.Fragment>
		);
  	}
}