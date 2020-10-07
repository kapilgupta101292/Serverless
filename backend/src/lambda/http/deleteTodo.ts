import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteTodo } from '../../businesslogic/todos'

const logger = createLogger('http.deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.debug(`Processing event for Delete Todo event:  ${event}`)

    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization

    logger.debug(`Deleting the Todo with todoId: ${todoId}`)
    await deleteTodo(authorization, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(cors({ credentials: true }))
