import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser } from '../../businesslogic/todos'

const logger = createLogger('http.getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.debug(`Processing event for Get Todo event:  ${event}`)

    const authorization = event.headers.Authorization
    const todoItems = await getTodosForUser(authorization)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todoItems
      })
    }
  }
)

handler.use(cors({ credentials: true }))
