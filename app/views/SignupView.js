import React from 'react'
import { Link } from 'react-router-dom'

import { AUTH_LANDING } from './../tools/Constants'
import Form from './../components/Form'
import View from '../components/View';

export default class LoginView extends View {

	constructor(props){
		super(props)
	}
	
	render() {
		return (
			<div className="view">
				<h1>{"Sign up"}</h1>
				<Form 
					endpoint={'user.create'}
					fields={{
						name: { type: 'text', title: 'Name' },
						email: { type: 'email', title: 'Email' },
						password: { type: 'password', title: 'Password'},
						confirmPassword: { type: 'password', title: 'Confirm password'}
					}}
					redirect={AUTH_LANDING} />
				<Link to={"/login"}>Login</Link>
			</div>
		);
  	}
}