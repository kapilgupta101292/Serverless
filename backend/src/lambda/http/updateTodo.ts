import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import * as AWS from 'aws-sdk'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const logger = createLogger('http.updateTodo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.debug('Processing the Todo for update', todoId)
  logger.debug('Processing the updated object', updatedTodo)

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
    logger.error('Error occurred while updating the Todo', event, err)
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

  logger.debug('Update successful for the todoId, new Todo', result)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}
