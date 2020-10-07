import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { TodoDelete } from "../models/TodoDelete";
import { createLogger } from "../utils/logger";

const logger = createLogger("dataLayer.todoAccess");

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexTable = process.env.INDEX_TABLE
  ) {}

  async getTodosForUser(userId: String): Promise<TodoItem[]> {
    logger.debug(`Getting all Todos for user ${userId}`);

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.indexTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
        ScanIndexForward: false,
      })
      .promise();

    const items = result.Items;
    logger.debug(`Got the following Todos for user ${items}`);
    return items as TodoItem[];
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.debug(`Creating new Todo with info ${todoItem}`);

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
      })
      .promise();

    logger.debug(`Created the required Todo`);
    return todoItem as TodoItem;
  }

  async updateTodo(todoUpdate: TodoUpdate) {
    logger.debug(`Updating the todo with the following info ${todoUpdate}`);
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: todoUpdate.userId,
          todoId: todoUpdate.todoId,
        },
        UpdateExpression: "set #n = :nameVal, #dd = :dueDate, #d = :done",
        ExpressionAttributeNames: {
          "#n": "name",
          "#dd": "dueDate",
          "#d": "done",
        },
        ExpressionAttributeValues: {
          ":name": todoUpdate.name,
          ":dueDate": todoUpdate.dueDate,
          ":done": todoUpdate.done,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  async updateTodoURL(userId: string, todoId: string, attachmentUrl: string) {
    logger.debug(`Updating the todo with the following info ${attachmentUrl}`);
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        UpdateExpression: "set #au = :attachmentUrl",
        ExpressionAttributeNames: {
          "#au": "attachmentUrl",
        },
        ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  async deleteTodo(todoDelete: TodoDelete) {
    logger.debug(`Deleting the todo with info ${todoDelete}`);

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId: todoDelete.userId, todoId: todoDelete.todoId },
      })
      .promise();
  }
}
