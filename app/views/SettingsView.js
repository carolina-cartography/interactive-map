import React from 'react'
import View from '../components/View';

export default class SettingsView extends View {

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="view container">
				<h1>{"Settings"}</h1>
			</div>
		);
  	}
}