import React from 'react'
import Authentication from './../tools/Authentication'
export default class View extends React.Component {
	constructor(props) {
		super(props)
		let { inside, history } = props
		let isAuthenticated = Authentication.isAuthenticated()
		if ((inside && !isAuthenticated) || (!inside && isAuthenticated)) {
			history.replace('/')
		}
	}
}

