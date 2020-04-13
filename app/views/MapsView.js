import React from 'react'
import { Link } from 'react-router-dom'
import View from '../components/View';

export default class MapsView extends View {

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="view container">
				<h1>{"Maps"}</h1>
				<Link to="/map/vieques">Vieques</Link>
			</div>
		);
  	}
}