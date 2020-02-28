import React from 'react'

const renderElement = props => {
	const { type, value, placeholder, handler } = props;
	if (type === 'textarea')
		return <textarea value={value} onChange={handler} placeholder={placeholder}></textarea>
	else 
		return <input type={type} value={value} onChange={handler} placeholder={placeholder} />
}

export default function Field(props) {
	const { type, title, css, instructions, error } = props;
	return (
		<div className={`field ${type} ${error ? 'error' : null} ${css}`}>
			{title && <div className='title'>{title}</div>}
			{renderElement(props)}
			{error && <div className="error">{error}</div>}
			{instructions && <div className="instructions">{instructions}</div>}
		</div>
	);
}
