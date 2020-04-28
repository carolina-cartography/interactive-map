import React from 'react'
import Form from './Form'

export default class PlaceModal extends React.Component {

	constructor(props) {
		super(props)
		this.close = this.close.bind(this)
		this.formatRequest = this.formatRequest.bind(this)
		this.onSuccess = this.onSuccess.bind(this)
	}

	componentDidMount() {
	}

	componentWillUnmount() {
	}

	close() {
		this.props.close();
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
		formattedRequest.coordinates = [
			newPlace._latlng.lat,
			newPlace._latlng.lng
		];

		return formattedRequest
	}

	onSuccess(response) {
		this.props.close(response.place);
	}

	render() {
		const { newPlace, place } = this.props;
		return (
			<div className="modal-container">
				<div className="underlay" onClick={this.close}></div>
				<div className="modal">
					{newPlace && <React.Fragment>
						<Form
							endpoint="place.create"
							fields={{
								title: { type: 'text', title: 'Title', required: true },
								description: { type: 'textarea', title: 'Description'}
							}}
							formatRequest={this.formatRequest}
							onSuccess={this.onSuccess}
						/>
					</React.Fragment>}
					{place && <div>
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