import React from 'react'
import { Route, Redirect, Router, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { LANDING } from './tools/Constants'

// Components and views
import Header from './components/Header'
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import MapsView from './views/MapsView'
import SettingsView from './views/SettingsView'

// Maps
import Vieques from './views/maps/Vieques'
import MississippiStory from './views/maps/MississippiStory'

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
						<Route path="/map/vieques" render={props => <Vieques {...props} />}></Route>
						<Route path="/map/mississippi" render={props => <MississippiStory {...props} />}></Route>
						<Route path="/settings" render={props => <SettingsView inside={true} {...props} />}></Route>
						<Route path="*"><Redirect to={LANDING} /></Route>
					</Switch>
				</Router>
			</div>
		);
	}
}