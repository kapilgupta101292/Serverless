import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const todoAccess = new TodoAccess()

const logger = createLogger('businesslogic.todos')

export async function getTodosForUser(
  authorization: string
): Promise<TodoItem[]> {
  logger.debug(`Start of getTodosForUser with authorization ${authorization}`)
  const userId = parseUserId(authorization)
  logger.debug(`userId: ${userId}`)

  return todoAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  authorization: string
): Promise<TodoItem> {
  logger.debug(
    `Start of createTodo with authorization ${authorization}, createTodoRequest ${createTodoRequest}`
  )

  const todoId = uuid.v4()
  const userId = parseUserId(authorization)
  logger.debug(`userId: ${userId}`)

  return await todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    ...createTodoRequest
  })
}

export async function updateTodo(
  authorization: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  logger.debug(
    `Start of updateTodo with authorization ${authorization}, todoId ${todoId}, updateTodoRequest ${updateTodoRequest}`
  )
  const userId = parseUserId(authorization)
  logger.debug(`userId: ${userId}`)

  await todoAccess.updateTodo({
    todoId: todoId,
    userId: userId,
    ...updateTodoRequest
  })
}

export async function updateTodoURL(
  authorization: string,
  todoId: string,
  attachmentUrl: string
) {
  logger.debug(
    `Start of updateTodo with authorization ${authorization}, todoId ${todoId}, attachmentUrl ${attachmentUrl}`
  )
  const userId = parseUserId(authorization)
  logger.debug(`userId: ${userId}`)

  await todoAccess.updateTodoURL(userId, todoId, attachmentUrl)
}

export async function deleteTodo(authorization: string, todoId: string) {
  logger.debug(
    `Start of deleteTodo with authorization ${authorization}, todoId ${todoId}`
  )
  const userId = parseUserId(authorization)
  await todoAccess.deleteTodo({
    userId,
    todoId
  })
}
