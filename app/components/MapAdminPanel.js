import React from 'react'
import Requests from '../tools/Requests'
import ImportModal from './ImportModal'

export default class MapAdminPanel extends React.Component{

    constructor(props) {
        super(props)

        this.delete = this.delete.bind(this)
		this.edit = this.edit.bind(this)
        this.toggleImportModal = this.toggleImportModal.bind(this)
    }

    state = {
        deleting: false,
        deleteError: null,
        showImportModal: false,
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

    toggleImportModal() {
        this.setState({ showImportModal: !this.state.showImportModal });
    }

	render() {
        const { deleting, deleteError, showImportModal } = this.state
		return (
			<div className="admin-panel map-admin-panel">
                {showImportModal && <ImportModal map={this.props.map} close={this.toggleImportModal} />}
                <div className="admin-panel-buttons">
                    <span onClick={this.delete}>
                        {deleting
                            ? "Deleting..."
                            : "Delete map"}
                    </span>
                    <span onClick={this.edit}>{"Edit map"}</span>
                    <span onClick={this.toggleImportModal}>{"Import data"}</span>
                    {deleteError && <div className="admin-error">
                        {`Delete failed: ${deleteError}`}
                    </div>}
                </div>
            </div>
		);
	}
}


