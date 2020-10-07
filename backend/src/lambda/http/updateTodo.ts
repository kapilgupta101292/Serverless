import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { updateTodo } from '../../businesslogic/todos'

const logger = createLogger('http.updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.debug(`Processing event for Update Todo event:  ${event}`)

    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    logger.debug(
      `Processing the Todo for todoId: ${todoId} with info: ${updatedTodo}`
    )
    await updateTodo(authorization, todoId, updatedTodo)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(cors({ credentials: true }))
