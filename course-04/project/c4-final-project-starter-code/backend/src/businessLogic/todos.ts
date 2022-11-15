import { APIGatewayProxyEvent } from 'aws-lambda';
import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodosAccess } from '../helpers/todosAcess'
import { getUserId } from '../lambda/utils'

const todoAccess = new TodosAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodos()
}

export async function  createTodo(
  createTodoRequest: CreateTodoRequest,
  event: APIGatewayProxyEvent
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = getUserId(event)

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    done:false,
    createdAt: new Date().toISOString(),
    ...createTodoRequest
  })
}
