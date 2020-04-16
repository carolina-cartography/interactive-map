import React from 'react'

export default class PlaceModal extends React.Component {

	constructor(props) {
		super(props)
		this.close = this.close.bind(this)
	}

	componentDidMount() {
	}

	componentWillUnmount() {
	}

	close() {
		this.props.close();
	}

	render() {
		const { place } = this.props;
		return (
			<div className="modal-container">
				<div className="underlay" onClick={this.close}></div>
				<div className="modal">
					{`User: ${place.userName}`}<br />
					{`Location: ${place.location.coordinates}`}
				</div>
			</div>
		);
  	}
}