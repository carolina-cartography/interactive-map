import React from 'react'
import { Link } from 'react-router-dom'
import View from '../components/View';
import Requests from '../tools/Requests'

export default class MapsView extends View {

	constructor(props) {
		super(props)
	}

	state = {
		maps: [],
		loading: false,
	}

	componentDidMount() {
		this.setState({ loading: true })
		Requests.do('map.list', {})
			.then((response) => {
				this.setState({ loading: false, maps: response.maps })
			})
			.catch((response) => {
				this.setState({ loading: false, error: response.message })
			})
	}

	render() {
		const { maps, loading, error } = this.state;
		return (
			<div className="view container">
				<h1>{"Maps"}</h1>
				{loading && "Loading..."}
				{error && `Error: ${error}`}
				{maps.length < 1 && "No maps"}
				{maps.map((map) => <Link to={`/map/${map.id}`}>
					<div className="map-item">
						<h2>{map.name}</h2>
						{map.description && <p>{map.description}</p>}
					</div>
				</Link>)}
			</div>
		);
  	}
}