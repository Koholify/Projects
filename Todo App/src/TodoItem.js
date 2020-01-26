import React from "react"
import "./style.css"

function TodoItem(props) {
    const completedStyle = {
        fontStyle: "italic",
        color: "#cdcdcd",
        textDecoration: "line-through",
    }
    const dueStyle = {
        fontWeight: "100",
        color: "#FFFFFF",
        backgroundColor: "#EE0000"
    }

    var dateDue = new Date(props.item.dueDate)
    dateDue.setTime(dateDue.getTime() + 3.5*60*60*1000)
    const dateNow = Date.now()
    
    return (
        <div className="horz">
            <div className="todo-item" align='left'>
                <input 
                    type="checkbox" 
                    checked={props.item.completed} 
                    onChange={() => props.handleChange(props.item.id)}
                />
                <p style={props.item.completed ? completedStyle: null}>{props.item.text}</p>
            </div>
            <div className="date" style={(props.item.dueDate!==null && dateDue <= dateNow) ? dueStyle:null}>
                <p>Do By: {props.item.dueDate}</p>
            </div>
            <div onClick={() => props.delItems(props.item.id)}>
                <p align='right' style = {{color:"#0000EE"}}>delete</p>
            </div>
            
            
        </div>
    )
}

export default TodoItem