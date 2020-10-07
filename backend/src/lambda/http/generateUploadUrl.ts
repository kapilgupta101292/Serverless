import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

import * as AWS from 'aws-sdk'

import * as AWSXRay from 'aws-xray-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('http.generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.debug(`Processing event for generateUploadUrl :  ${event}`)
    const todoId = event.pathParameters.todoId
    logger.debug('Generating URL for the todoId:', todoId)
    const signedURL = getUploadUrl(todoId)
    logger.debug('Generated URL for the todoId:', signedURL)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: signedURL
      })
    }
  }
)

handler.use(cors({ credentials: true }))

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}
