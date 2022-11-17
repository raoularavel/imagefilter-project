import { APIGatewayProxyEvent } from 'aws-lambda';
import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodosAccess } from '../helpers/todosAcess'
import { getUserId } from '../lambda/utils'

const todoAccess = new TodosAccess()

export async function deleteTodo(todoId:string,userId: string) {

  return todoAccess.deleteTodo(todoId,userId)
}
 
export async function updateTodo(todo: TodoItem): Promise<TodoItem> {

  return todoAccess.updateTodo(todo)
}
 
export async function getTodoById(todoId: string): Promise<TodoItem> {
  return todoAccess.getTodoById(todoId)
}

export async function getTodosByUserId(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
  return todoAccess.getTodosByUserId(getUserId(event))
}

export async function  createTodo(
  createTodoRequest: CreateTodoRequest,
  event: APIGatewayProxyEvent
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = getUserId(event)

  const res =  await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    done:false,
    createdAt: new Date().toISOString(),
    ...createTodoRequest
  })

  return res;
}
