import React from "react"

class Buttons extends React.Component {

    render () {
        return (
            <div className="button">
                <button onClick={this.props.addItem}>Add Item</button>
                <button onClick={this.props.sortItems}>Sort Items</button>
            </div>
            
        )
    }
}

export default Buttons