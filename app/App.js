import React from 'react'
import { Route, Redirect, Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { AUTH_LANDING, NO_AUTH_LANDING } from './tools/Constants'
import Authentication from './tools/Authentication'

// Components and views
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import MapView from './views/MapView'

// Create history
const history = createBrowserHistory();
export default class App extends React.Component{
	render() {
		return (
			<div className="container">
				<Router history={history}>
					<Header history={history} />
					<Route exact path="/">
						{Authentication.isAuthenticated() 
							? <Redirect to={AUTH_LANDING} /> 
							: <Redirect to={NO_AUTH_LANDING} />}
					</Route>
					<Route path="/login" render={props => <LoginView inside={false} {...props} />}></Route>
					<Route path="/signup" render={props => <SignupView inside={false} {...props} />}></Route>
					<Route path="/map" render={props => <MapView inside={true} {...props} />}></Route>
				</Router>
			</div>
		);
	}
}