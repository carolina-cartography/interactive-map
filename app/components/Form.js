import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'underscore'
import Field from './Field'
import Validation from './../tools/Validation'
import Requests from './../tools/Requests'

class Form extends React.Component {
	static propTypes = {
		title: PropTypes.string,
		fields: PropTypes.object,
		endpoint: PropTypes.string,
		formatRequest: PropTypes.func,
		onSuccess: PropTypes.func,
		redirect: PropTypes.string,
		css: PropTypes.string,
	}

	state = {
		fieldErrors: {}
	}

	getHandler = (key, field) => (event) => {
		event.preventDefault();
		const state = this.state;
		const { fields } = this.props;
		
		// Add latest value
		state[key] = event.target.value;

		// Revalidate fields if current field is errored
		if (state.fieldErrors[key]) 
			Validation.validateFormState(fields, state);
		
		// Update state
		this.setState(state);
	}

	handleSubmit = event => {
		event.preventDefault();
		const state = this.state;
		const { fields, endpoint, onSuccess, formatRequest, redirect } = this.props;

		// Validate fields
		Validation.validateFormState(fields, state);
		if (_.size(state.fieldErrors)) {
			return this.setState(state);
		}

		// Prepare request
		let request = {}
		Object.entries(fields).forEach(([key, field]) => {
			if (fields[key].prepare) 
				request[key] = fields[key].prepare(state[key]);
			else request[key] = state[key];
		})

		// Format request
		if (formatRequest) {
			request = formatRequest(request);
		}

		// Make request
		this.setState({ loading: true });
		Requests.do(endpoint, request).then((response) => {
			this.setState({ loading: false, formError: null });
			if (onSuccess) onSuccess(response)
			if (redirect) {
				this.props.history.push(redirect)
			}
		}).catch((response) => {
			this.setState({ loading: false, formError: response.message })
		})
	}

	render() {
		const { fieldErrors, formError } = this.state;
		const { title, fields, css } = this.props;
		return (
			<form className={`form ${css}`} onSubmit={this.handleSubmit}>
				{title && <div className="title">{title}</div>}
				{Object.entries(fields).map(([key, field]) => {
					return <Field key={key} {...field} error={fieldErrors[key]} handler={this.getHandler(key, field)} />
				})}
				{formError && <div className="formError">{formError}</div>}
				<input type="submit" value="Submit" />
			</form>
		)
  	}
}

export default withRouter(Form)
