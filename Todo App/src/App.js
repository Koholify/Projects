import React from "react"
import TodoItem from "./TodoItem"
import todosData from "./todosData"
import Buttons from "./Buttons"
import NewTask from "./NewTask"
import "./style.css"
import "./normalize.css"

class App extends React.Component {
    constructor() {
        super()
        this.key = todosData.length
        this.state = {
            newT: 0,
            todos: todosData
        }
        this.handleChange = this.handleChange.bind(this)
        this.addItem = this.addItem.bind(this)
        this.delItems = this.delItems.bind(this)
        this.sortItems = this.sortItems.bind(this)
        this.newTask = this.newTask.bind(this)
    }
    
    handleChange(id) {
        this.setState(prevState => {
            const updatedTodos = prevState.todos.map(todo => {
                if (todo.id === id) {
                    todo.completed = !todo.completed
                }
                return todo
            })
            return {
                newT: 0,
                todos: updatedTodos
            }
        })
    }

    newTask() {
        this.setState(prevState => {return {newT: 1, todos: prevState.todos}})
    }

    newTaskDone() {
        this.setState(prevState => {return {newT: 0, todos: prevState.todos}})
    }

    //change so prevstate isnt changed
    addItem(item) {
        if(item.task==null || item.task==="") {
            this.newTaskDone()
            return
        }
        else{
            this.key = this.key + 1
            const task = {
                id: this.key,
                text: item.task,
                importance: item.importance,
                dueDate: item.dueDate,
                completed: false
            }
            this.setState(prevState => { 
                const updatedTodos = prevState.todos
                updatedTodos.push(task)
                return {
                    newT: 0,
                    todos: updatedTodos
                }
            })
        }
    }

    //change so it only del item with id
    delItems(id) {
        this.setState(prevState => {
            const updatedTodos = prevState.todos.filter(todo => todo.id !== id)
            return {
                newT: 0,
                todos: updatedTodos
            }
        })
    }

    sortItems(){
        this.setState(
            prevState => {
                const updatedTodos = prevState.todos.sort(
                        (todo1,todo2) => {
                            if(todo1.dueDate == null&&todo2.dueDate == null) return 0
                            if(todo1.dueDate == null) return 1
                            if(todo2.dueDate == null) return -1
                            var date1 = new Date(todo1.dueDate)
                            var date2 = new Date(todo2.dueDate)
                            if(date1 < date2) return -1
                            if(date1 > date2) return 1
                            return 0
                        }).sort(
                            (todo1,todo2) => todo1.importance-todo2.importance).sort(
                                (todo1,todo2) => todo1.completed-todo2.completed)
                return {
                    newT: 0, 
                    todos: updatedTodos
                }
            }
        )
    }
    
    
    render() {
        const todoItems = this.state.todos.map(item =>
             <TodoItem 
                key={item.id} 
                item={item} 
                delItems={this.delItems} 
                handleChange={this.handleChange}
            />)
        
        return (
            <div className="todo-list">
                {this.state.newT ? <NewTask addItem={this.addItem}/> : <br/>}
                <Buttons addItem={this.newTask} sortItems={this.sortItems}/>
                {todoItems}
            </div>
        )    
    }
}

export default App