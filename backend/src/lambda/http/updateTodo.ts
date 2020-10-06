import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import * as AWS from 'aws-sdk'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
// const userIdIndex = process.env.USER_ID_INDEX

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  console.log(todoId)
  console.log(updatedTodo)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  let result
  try {
    const newTodoBody: UpdateTodoRequest = JSON.parse(event.body)
    result = await docClient
      .update({
        TableName: todosTable,
        Key: {
          todoId: todoId
        },
        UpdateExpression: 'set #n = :nameVal, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ExpressionAttributeValues: {
          ':nameVal': newTodoBody.name,
          ':dueDate': newTodoBody.dueDate,
          ':done': newTodoBody.done
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: err
      })
    }
  }
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      result
    })
  }
}
