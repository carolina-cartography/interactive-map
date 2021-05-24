import React from 'react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, LANDING, LOGO_LINK } from './../tools/Constants'
import Authentication from './../tools/Authentication'

export default class Header extends React.Component{

	constructor(props) {
		super(props)
		this.toggleMobileNav = this.toggleMobileNav.bind(this)
	}
	
	state = {
		path: location.pathname,
		loggedIn: Authentication.isAuthenticated(),
		isAdmin: Authentication.isAdmin(),
		mobileNavOpen: false,
	}

	componentDidMount() {
		this.props.history.listen((location) => {
			this.setState({
				path: location.pathname,
				loggedIn: Authentication.isAuthenticated(),
				isAdmin: Authentication.isAdmin(),
				mobileNavOpen: false,
			})
		})
	}

	toggleMobileNav() {
		this.setState({ mobileNavOpen: !this.state.mobileNavOpen })
	}

	logout() {
		Authentication.logout();
	}

	render() {
		const { path, loggedIn, isAdmin, mobileNavOpen } = this.state
		return (
			<header className={loggedIn ? "inside" : null}>
				<div className={path.includes('/map/') ? "container map-container" : "container"}>
					<a href={LOGO_LINK}><div className="logo">{APP_NAME}</div></a>
					<div className="mobile-nav-toggle" onClick={this.toggleMobileNav}>{"Menu"}</div>
					<div className={mobileNavOpen ? "navigation expanded" : "navigation"}>
						<div className="menu main-menu">
							<NavLink to="/maps">{"Maps"}</NavLink>
						</div>
						{loggedIn 
							? <div className="menu user-menu">
								{isAdmin && <NavLink to="/new">{"New Map"}</NavLink>}
								<NavLink to="/settings">{"Settings"}</NavLink>
								<NavLink className="logout" to={LANDING} onClick={this.logout}>{"Logout"}</NavLink>
							</div> 
							: <div className="menu user-menu">
								<NavLink to="/login">{"Login"}</NavLink>
								<NavLink to="/signup">{"Sign Up"}</NavLink>
							</div>}
					</div>
				</div>
			</header>
		);
	}
}