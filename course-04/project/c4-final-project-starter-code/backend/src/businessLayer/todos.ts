import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { APIGatewayEvent } from 'aws-lambda';
import { getUserId } from '../lambda/utils';

// TODO: Implement businessLogic

export  function todoBuilder(todoRequest:CreateTodoRequest, event: APIGatewayEvent): TodoItem {
    const todoId = uuid.v4()

    const todo = {
      todoId: todoId,
      userId: getUserId(event),
      createdAt: new Date().toISOString(),
      name: todoRequest.name,
      dueDate: todoRequest.dueDate,
      done: false,
      attachmentUrl: '',
      ... todoRequest
    }
    return todo as TodoItem
}


export  function updateTodoBuilder(todoRequest: UpdateTodoRequest): TodoItem {

  const todo = {
    name: todoRequest.name,
    dueDate: todoRequest.dueDate,
    done: todoRequest.done,
    ... todoRequest
  }
  return todo as TodoItem
}