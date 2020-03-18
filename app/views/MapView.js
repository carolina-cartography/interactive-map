import React from 'react'
import View from '../components/View';
import Authentication from '../tools/Authentication';

export default class MapView extends View {

	constructor(props){
		super(props)
		this.logout = this.logout.bind(this)
	}

	logout() {
		Authentication.logout()
		this.props.history.push('/')
	}

	render() {
		const user = Authentication.getUser()
		return (
			<div className="view">
				<div>Welcome, {user ? user.name : null}</div>
				<h1>{"Map view"}</h1>
				<div onClick={this.logout}>Log out</div>
			</div>
		);
  	}
}