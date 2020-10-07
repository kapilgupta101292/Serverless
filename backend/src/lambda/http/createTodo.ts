import 'source-map-support/register'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const logger = createLogger('http.createTodo')
const groupsTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing event: ', event)
  const todoId = uuid.v4()
  const newTodoBody: CreateTodoRequest = JSON.parse(event.body)

  const newTodoItem = {
    todoId,
    userId: getUserId(event),
    ...newTodoBody
  }
  logger.debug(' New Todo Item :', newTodoItem)
  try {
    await docClient
      .put({
        TableName: groupsTable,
        Item: newTodoItem
      })
      .promise()
  } catch (err) {
    logger.error('Error occurred while creating the Todo', event, err)
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

  logger.debug('Successfully created the Todo')
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newTodoItem
    })
  }
}
