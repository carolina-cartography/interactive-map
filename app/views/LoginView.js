import React from 'react'
import { Link } from 'react-router-dom'

import { AUTH_LANDING } from './../tools/Constants'
import Form from '../components/Form'
import View from '../components/View';

export default class LoginView extends View {

	constructor(props){
		super(props)
	}

	render() {
		return (
			<div className="view">
				<h1>{"Login"}</h1>
				<Form
					history={this.props.history}
					endpoint={'user.login'}
					fields={{
						email: { type: 'email', title: 'Email' },
						password: { type: 'password', title: 'Password'}
					}}
					redirect={AUTH_LANDING} />
				<Link to={"/signup"}>Sign up</Link>
			</div>
		);
  	}
}