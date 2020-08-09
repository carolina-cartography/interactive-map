import React from 'react'
import { Route, Redirect, Router, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { LANDING } from './tools/Constants'

// Components and views
import Header from './components/Header'
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import MapsView from './views/MapsView'
import MapView from './views/MapView'
import MapEditView from './views/MapEditView'
import SettingsView from './views/SettingsView'

// Create history
const history = createBrowserHistory();
export default class App extends React.Component{
	render() {
		return (
			<div className="app">
				<Router history={history}>
					<Header history={history} />
					<Switch>
						<Route exact path="/"><Redirect to={LANDING} /></Route>
						<Route path="/login" render={props => <LoginView inside={false} {...props} />}></Route>
						<Route path="/signup" render={props => <SignupView inside={false} {...props} />}></Route>
						<Route path="/maps" render={props => <MapsView {...props} />}></Route>
						<Route path="/map/:id" render={props => <MapView {...props} />}></Route>
						<Route path="/map/:id/edit" render={props => <MapEditView {...props} />}></Route>
						<Route path="/new" render={props => <MapEditView {...props} />}></Route>
						<Route path="/settings" render={props => <SettingsView inside={true} {...props} />}></Route>
						<Route path="*"><Redirect to={LANDING} /></Route>
					</Switch>
				</Router>
			</div>
		);
	}
}