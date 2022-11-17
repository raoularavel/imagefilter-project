import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
//import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableIndex = process.env.TODOS_CREATED_AT_INDEX,
  ) {
  }

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    return result.Items as TodoItem[];
  }

  async getTodoById(todoId: string): Promise<TodoItem> {
    logger.info('Getting all todos')
    const result = await this.docClient.query({
      IndexName: this.todosTableIndex,
      TableName: this.todosTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise()

    if (result.Count) {

      return result.Items[0] as TodoItem;
    }
    return null;

  }
/*
  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Update todo by Id')
    const toupdate = await this.getTodoById(todo.todoId)
    const result = await this.docClient.update({
      Key: {
        userId:toupdate.userId,
        todoId:toupdate.todoId
      },
      TableName: this.todosTable,
      UpdateExpression: 'set done = :done',
      ExpressionAttributeValues: {
        ':done': toupdate.done
      }
    }).promise()

    return result.Attributes as TodoItem;

  }
*/
  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Update todo by Id')
    logger.info(todo)
    const result = await this.docClient.update({
      Key: {
        userId:todo.userId,
        todoId:todo.todoId
      },
      TableName: this.todosTable,
      UpdateExpression: 'set attachmentUrl = :attachmentUrl, done = :done, dueDate = :dueDate',
      ExpressionAttributeValues: {
        ':attachmentUrl': todo.attachmentUrl,
        ":done": todo.done,
        ":dueDate": todo.dueDate,
      }
    }).promise()

    return result.Attributes as TodoItem;

  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo,
    }).promise()
     return todo
  }


  async deleteTodo(todoId: string,userId: string) {
    return await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
