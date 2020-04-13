import React from 'react'
import { LANDING } from './../tools/Constants'
import Authentication from './../tools/Authentication'
export default class View extends React.Component {
	constructor(props) {
		super(props)
		let { inside, history } = props
		let isAuthenticated = Authentication.isAuthenticated()
		if (inside === false && isAuthenticated) {
			history.replace(LANDING)
		}
		if (inside === true && !isAuthenticated) {
			history.replace(LANDING)
		}
	}
}

