import * as AWS from 'aws-sdk'
const AWSXRay  = require('aws-xray-sdk')
import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb' 
import { createLogger } from '../utils/logger'
// import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const todosTable = process.env.TODOS_TABLE
const todosIndex = process.env.TODOS_CREATED_AT_INDEX

const docClient: DocumentClient = createDynamoDBClient()
// TODO: Implement the dataLayer logic

console.log(logger, XAWS)


export async function createTodo(todo:TodoItem): Promise<TodoItem> {
    await docClient.put({
        TableName: todosTable,
        Item: todo
    })
    .promise()
    return todo
}

export async function getAllTodosByUserId(userId: string): Promise<TodoItem[]>  {

  const result = await docClient.query({
    TableName : todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId
    }
  }).promise()

  const items = result.Items
  return items as TodoItem[]
  
}

export async function getTodoById(todoId: string): Promise<TodoItem> {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: todosIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()

  const items = result.Items
  return items[0] as TodoItem

}

export async function updateTodoURL(todo: TodoItem): Promise<TodoItem> {
  const result = await docClient.update({
    TableName: todosTable,
    Key: {
      userId: todo.userId,
      todoId: todo.todoId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
        ':attachmentUrl': todo.attachmentUrl
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  const items = result.Attributes
  return items as TodoItem

}

export async function updateTodo(todo: UpdateTodoRequest, userId: string, todoId: string): Promise<TodoItem> {
  
  console.log(todo, userId, todoId)
  const result = await docClient.update({
    TableName: todosTable,
    Key: {
      userId: userId,
      todoId: todoId
    },
    UpdateExpression: 'set  #todo_name = :name, #todo_dueDate = :dueDate, #todo_done = :done',
    ExpressionAttributeValues: {
        ':name': todo.name,
        ':dueDate': todo.dueDate,
        ':done': todo.done
    },
    ExpressionAttributeNames: {
      '#todo_name': 'name',
      '#todo_dueDate': 'dueDate',
      '#todo_done': 'done'    
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  const items = result.Attributes
  return items as TodoItem

}

export async function deleteTodoById(todoId: string, userId: string) {
  const result = await docClient.delete({
    TableName: todosTable,
    Key: {
      todoId: todoId,
      userId: userId
    }
  }).promise()

  return result
}

function createDynamoDBClient () {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
          region: 'localhost',
          endpoint: 'http://localhost:8000'
        })
      }
    
      return new XAWS.DynamoDB.DocumentClient()
}