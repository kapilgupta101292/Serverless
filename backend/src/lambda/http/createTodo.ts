import "source-map-support/register";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { createLogger } from "../../utils/logger";

import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createTodo } from "../../businesslogic/todos";

const logger = createLogger("http.createTodo");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.debug("Processing event for Create Todo: ", event);

    const createTodoRequest: CreateTodoRequest = JSON.parse(event.body);
    const authorization = event.headers.Authorization;
    const createdTodo = await createTodo(createTodoRequest, authorization);

    logger.debug("Created Todo: ", createdTodo);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: createdTodo,
      }),
    };
  }
);
handler.use(cors({ credentials: true }));
