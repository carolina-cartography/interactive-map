import React from 'react'
import Requests from '../tools/Requests'

export default class MapAdminPanel extends React.Component{

    constructor(props) {
        super(props)

        this.delete = this.delete.bind(this)
		this.edit = this.edit.bind(this)
    }

    state = {
        deleting: false,
        deleteError: null,
    }

    delete() {
		const { map } = this.props;
		this.setState({ deleting: true });
		Requests.do("map.delete", {
			guid: map.guid,
		}).then(() => {
			this.props.history.push("/maps")
		}).catch(response => {
			this.setState({ deleting: false, deleteError: response.message });
		})
	}

	edit() {
		const { map } = this.props;
		this.props.history.push(`/map/${map.id}/edit`);
	}

	render() {
        const { deleting, deleteError } = this.state
		return (
			<div className="admin-panel map-admin-panel">
                <span onClick={this.delete}>
                    {deleting
                        ? "Deleting..."
                        : "Delete map"}
                </span>
                <span onClick={this.edit}>{"Edit map"}</span>
                {deleteError && <div className="admin-error">
                    {`Delete failed: ${deleteError}`}
                </div>}
            </div>
		);
	}
}


