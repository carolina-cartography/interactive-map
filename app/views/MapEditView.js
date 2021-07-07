import React from 'react'
import View from '../components/View';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import Form from '../components/Form';
import Requests from '../tools/Requests';
import { clone } from '../tools/Helpers';

// Initialize map outside of any function
var map;
var mapObject
const fieldsTemplate = {
	name: { type: 'text', title: 'Name' },
	id: { type: 'text', title: 'ID (used for this map\'s URL)'},
	description: { type: 'textarea', title: 'Description' },
	tiles: { 
		type: 'text', 
		title: "Tiles URL (URL including {z}/{x}/{y})", 
		placeholder: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
	},
	tmsTiles: { type: 'checkbox', title: 'TMS Tiles' },
	metadata: {
		type: 'repeater',
		title: 'Metadata',
		fields: {
			name: { type: 'text', title: 'Name' },
			inputType: { type: 'select', title: 'Input type', options: [
				{ name: 'text', title: 'Text' },
				{ name: 'textarea', title: 'Paragraph' },
				{ name: 'checkbox', title: 'Checkbox' }
			]}
		},
		rows: [],
	}
}

export default class MapEditView extends View {

	constructor(props) {
		super(props)
		this.onSuccess = this.onSuccess.bind(this)
		this.setupEditView = this.setupEditView.bind(this)
	}

	state = {
		endpoint: '',
	}

	componentDidMount() {
		this._isMounted = true;
		this.initialize(this.props.location)
		this.props.history.listen((location) => {
			this.initialize(location)
		})
	}
	
	componentWillUnmount() {
		this._isMounted = false;
	}

	initialize(location) {
		this.setState({ fields: null }, () => {
			this.setupMap()
			if (location.pathname && location.pathname.includes("edit")) 
				this.setupEditView()
			else this.setupCreateView();
		})
	}

	setupEditView() {
		if (this._isMounted) this.setState({ loading: true })
		Requests.do("map.get", {
			id: this.props.match.params.id,
		}).then((response) => {
			mapObject = response.map
			
			let fields = clone(fieldsTemplate)

			// Populate saved fields
			fields.id.value = mapObject.id
			fields.name.value = mapObject.name
			fields.description.value = mapObject.description
			fields.tiles.value = mapObject.tiles

			// Set map center
			map.setView(mapObject.coordinates, mapObject.zoom)

			if (this._isMounted) this.setState({ fields, endpoint: 'map.edit', loading: false })
		}).catch((response) => {
			if (this._isMounted) this.setState({ loading: false, error: response.message })
		})
	}

	setupCreateView() {
		if (this._isMounted) this.setState({ fields: clone(fieldsTemplate), endpoint: 'map.create' })
	}

	setupMap() {
		if (map !== undefined) map.remove();
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
		const { fields, endpoint } = this.state;
		return (
			<React.Fragment>
				<div className="container view">
					{endpoint.includes('create') && <h1>{"Create a new map"}</h1>}
					{endpoint.includes('edit') && <h1>{"Edit map"}</h1>}
					<div className="map-edit-container">
						{"Select the default center and zoom for your map:"}
						<div id="leaflet"></div>
					</div>
					{fields && <Form 
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