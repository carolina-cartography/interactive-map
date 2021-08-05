import React from 'react'
import Papa from 'papaparse'
import Requests from './../tools/Requests'

export default class ImportModal extends React.Component {

	constructor(props) {
		super(props)
        this.importTableRef = React.createRef()
        this.overlayClick = this.overlayClick.bind(this)
        this.handleHeaderCheckboxClick = this.handleHeaderCheckboxClick.bind(this)
        this.handleFileUpload = this.handleFileUpload.bind(this)
        this.handleImport = this.handleImport.bind(this)
	}

	state = {
        error: null,
        hasHeaderRow: false,
        columns: []
	}

	overlayClick() {
		this.props.close()
	}

    handleHeaderCheckboxClick(event) {
        this.setState({ hasHeaderRow: event.target.value })
    }

    handleFileUpload(event) {
        const { hasHeaderRow } = this.state
        let file = event.target.files[0]
        let reader = new FileReader()
        reader.onload = (readerFile) => {
            let parsed = Papa.parse(readerFile.target.result)
            let columns
            if (hasHeaderRow) {
                columns = parsed.data.shift()
            } else {
                columns = parsed.data[0]
            }
            this.data = parsed.data
            this.setState({ columns })
        }
        reader.readAsText(file)
    }

    handleImport() {
        const { hasHeaderRow } = this.state
        this.setState({ error: null })
        let importDetails = {
            metadataTitles: {},
        }
        let table = document.querySelector("#import-table")
        let rows = table.querySelectorAll("tr")
        for (let row of rows) {
            let index = row.id;
            if (index == "") continue // Skip empty rows
            let type = row.querySelector("select[name='field-type']").value
            if (type === "ignore") continue // Ignore 'ignore' fields
            if (type !== "metadata") {
                if (importDetails[type] !== undefined) {
                    this.setState({ error: `Please select only one field for "${type}"` })
                    return
                }
                importDetails[type] = index
            } else {
                let metadataTitle = row.querySelector("input[name='metadata-title']").value
                let metadataKey = 
                if (hasHeaderRow)
                importDetails.metadataTitles[`${index}`] = metadataTitle
            }
        }
        
        Requests.do("place.import", {
            map: this.props.map.guid,
            data: this.data,
            importDetails,
        })
    }

    preview(str) {
        if (str.length < 25) return str
        else return str.substring(0, 25) + "..."
    }

	render() {
        const { columns, error } = this.state;
		return (
			<div className="import-modal modal-container">
				<div className="underlay" onClick={this.overlayClick}></div>
				<div className="modal">
                    <div className="padded">
                        <h2>{"Import data"}</h2>
                        <p>{"Upload a CSV file"}</p>
                        <input type="checkbox" onClick={this.handleHeaderCheckboxClick} />
                        <label>{"Data has a header row"}</label>
                        <br />
                        <input type="file" accept=".csv" onChange={this.handleFileUpload} />
                    </div>
                    {columns.length > 0 && <div className="import-form padded">
                        {"Select which columns to import below. A latitude and longitude field are required."}
                        <table id="import-table">
                            <thead>
                                <tr>
                                    <th>{"CSV Header / Preview"}</th>
                                    <th>{"Field Type"}</th>
                                    <th>{"Metadata Name"}</th>
                                </tr>
                            </thead>
                            <tbody>{columns.map((index, column) => {
                                return <tr id={index} key={index}>
                                    <td>
                                        {this.preview(column)}
                                    </td>
                                    <td>
                                        <select name="field-type">
                                            <option value="ignore">{"Ignore field"}</option>
                                            <option value="title">{"Title"}</option>
                                            <option value="latitude">{"Latitude"}</option>
                                            <option value="longitude">{"Longitude"}</option>
                                            <option value="metadata">{"Metadata"}</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input name="metadata-title" type="text"></input>
                                    </td>
                                </tr>
                            })}</tbody>
                        </table>
                        {error ? <p>{error}</p> : null}
                        <input type="submit" value="Import data" onClick={this.handleImport} />
                    </div>}
				</div>
			</div>
		);
  	}
}