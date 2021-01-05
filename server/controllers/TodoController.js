const { Todo } = require('../models');
const { MyError } = require('../helpers/myError');

class TodoController {
    static getTodos(req, res, next) {
        let user_id = req.user.id;

        Todo.findAll({
            where: {user_id},
            order: [['id', 'ASC']],
            attributes: {
                exclude: ['createdAt','updatedAt']
            }
        })
            .then(todos => res.status(200).json(todos))
            .catch(err => next(err))
    }

    static addTodo(req, res, next) {
        let newTodo = {
            title: req.body.title,
            description: req.body.description,
            status: "new todo",
            due_date: req.body.due_date,
            user_id: req.user.id
        }

        Todo.create(newTodo)
            .then(todo => res.status(201).json({
                id: todo.id,
                title: todo.title,
                description: todo.description,
                status: todo.status,
                due_date: todo.due_date,
                user_id: todo.user_id
            }))
            .catch(err => next(err))
    } 
   
    static getTodo(req, res, next) {
        let id = req.params.id;

        Todo.findOne({
            where: {id}, 
            attributes: {
                exclude: ['createdAt','updatedAt'],
            }
        })
            .then(todo => {
                if (todo) res.status(200).json(todo)
                else throw new MyError('Error not found','IdNotFound')
            })
            .catch(err => next(err))
    }

    static editTodo(req, res, next) {
        let id = req.params.id;
        let editTodo = {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            due_date: req.body.due_date
        }
        
        Todo.update(editTodo, {
            where: {id},
            returning: true,
        })
            .then(data => {
                let success = data[0];
                let updatedTodo = data[1][0];

                if (!success) {
                    throw new MyError('Error not found', 'IdNotFound')
                } else {
                    res.status(200).json({
                        id: updatedTodo.id,
                        title: updatedTodo.title,
                        description: updatedTodo.description,
                        status: updatedTodo.status,
                        due_date: updatedTodo.due_date
                    })
                } 
            })  
            .catch(err => next(err)) 
    }   

    static editStatusTodo(req, res, next) {
        let id = req.params.id;
        let editTodo = {
            status: req.body.status
        }

        Todo.update(editTodo, {
            where: {id},
            returning: true
        })
            .then(data => {
                let success = data[0];
                let updatedTodo = data[1][0];

                if (!success) {
                    throw new MyError('Error not found', 'IdNotFound')
                } else {
                    res.status(200).json({
                        id: updatedTodo.id,
                        title: updatedTodo.title,
                        description: updatedTodo.description,
                        status: updatedTodo.status,
                        due_date: updatedTodo.due_date
                    })
                }
            })
            .catch(err => next(err)) 
    }

    static deleteTodo(req, res, next) {
        let id = req.params.id;
        let deletedTodo = {};

        Todo.findOne({
            where: {id},
            attributes: {
                exclude: ['createdAt','updatedAt']
            }
        })
            .then(todo => {
                deletedTodo = todo;
                return Todo.destroy({ where: { id } })
            })
            .then(success => {
                if (!success) {
                    throw new MyError('Error not found', 'IdNotFound')
                } else {
                    res.status(200).json({
                        message: 'Todo success to delete',
                        data: deletedTodo
                    })  
                }
            })
            .catch(err => next(err))
    }
}  
  
module.exports = TodoController 