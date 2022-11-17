import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodoById, updateTodo } from '../../businessLogic/todos'
import { getUploadUrl } from '../../helpers/attachmentUtils'

 const  bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const todoId = event.pathParameters.todoId
        const todo = await getTodoById(todoId)
        todo.attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
        await updateTodo(todo)
        const uploadUrl = getUploadUrl(todo.todoId)
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                uploadUrl
            })
        }
    }

);

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
