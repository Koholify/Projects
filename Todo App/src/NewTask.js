import React from 'react'
import "./style.css"

class NewTask extends React.Component
{
    constructor() {
        super()
        this.state = {
            task: "",
            dueDate: "",
            importance: '5'
        }
    }

    info = (event) => {
        const name = event.target.name
        const value = event.target.value
        this.setState({[name]:value})
    }

    render() {
        return (
            <div style={{display:"flex", flexDirection:'column',alignItems:"left", height:250}}>
                <form>
                    <p>Enter New Task:</p>
                    <input type='text' name='task' onChange={this.info} />
                    <p>Enter Task Due Date</p>
                    <input type='date' name='dueDate' onChange={this.info}/>
                    <p>Enter importance of task (1 is highest importance)</p>
                    <input type='number' name='importance' placeholder='5' onChange={this.info} />
                    <br/>
                </form>
                <button style={{height:'25px',width:'60px'}}
                    onClick={() => this.props.addItem(this.state)}>Enter</button>
                <button style={{height:'25px',width:'60px'}}
                    onClick={() => this.props.addItem({task:""})}>Cancel</button>
                
            </div>
        )
    }
}

export default NewTask
