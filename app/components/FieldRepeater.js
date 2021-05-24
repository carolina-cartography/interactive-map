import React from 'react'

export default function FieldRepeater(props) {
	const { title, css, fields, rows, handler, addRepeaterRow } = props;
	return (
		<div className={`field repeater ${css ? css : ''}`}>
			{title && <div className='title'>{title}</div>}
            <div className="button" onClick={addRepeaterRow}>{"Add row"}</div>
            {rows.map((index, row) => {
                return <div key={index}>
                    {Object.keys(fields).map((key) => {
                        return <Field key={key} name={key} {...fields[key]} 
                            value={row[key]} handler={handler} ></Field>
                    })}
                </div>
            })}
		</div>
	);
}