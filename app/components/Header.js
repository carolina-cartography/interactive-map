import React from 'react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, LANDING, LOGO_LINK } from './../tools/Constants'
import Authentication from './../tools/Authentication'

export default class Header extends React.Component{
	
	state = {
		path: location.pathname,
		loggedIn: Authentication.isAuthenticated()
	}

	componentDidMount() {
		this.props.history.listen((location) => {
			this.setState({
				path: location.pathname,
				loggedIn: Authentication.isAuthenticated() 
			})
		})
	}

	logout() {
		Authentication.logout();
	}

	render() {
		const { path, loggedIn } = this.state
		return (
			<header className={loggedIn ? "inside" : null}>
				<div className={path.includes('/map/') ? "container map-container" : "container"}>
					<a href={LOGO_LINK}><div className="logo">{APP_NAME}</div></a>
					<div className="navigation">
						<div className="menu main_menu">
							<NavLink to="/maps">{"Maps"}</NavLink>
						</div>
						{loggedIn 
							? <div className="menu user_menu">
								<NavLink to="/settings">{"Settings"}</NavLink>
								<NavLink className="logout" to={LANDING} onClick={this.logout}>{"Logout"}</NavLink>
							</div> 
							: <div className="menu user_menu">
								<NavLink to="/login">{"Login"}</NavLink>
								<NavLink to="/signup">{"Sign Up"}</NavLink>
							</div>}
					</div>
				</div>
			</header>
		);
	}
}