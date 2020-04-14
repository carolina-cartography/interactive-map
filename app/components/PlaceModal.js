import React from 'react'

export default class PlaceModal extends React.Component {

	constructor(props) {
		super(props)
		this.close = this.close.bind(this)
	}

	componentDidMount() {
		console.log(this.props);
	}

	close() {
		this.props.close();
	}

	render() {
		const { leafletPlace } = this.props;
		return (
			<div className="modal-container">
				<div className="underlay" onClick={this.close}></div>
				<div className="modal">
					{`This overlay can be used to add a title and description to the new 
					marker at ${leafletPlace.marker._latlng}`}
				</div>
			</div>
		);
  	}
}