import React from 'react'
import View from '../components/View';

export default class MapView extends View {

	constructor(props){
		super(props)
	}

	render() {
		return (
			<div className="view">
				<h1>{"Map"}</h1>
			</div>
		);
  	}
}