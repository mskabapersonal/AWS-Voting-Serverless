import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyHandlerV2} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import VoteService from "../../../database/services/VoteService";

const dynamoDBClient:DocumentClient = new DynamoDB.DocumentClient();
const voteService = new VoteService(dynamoDBClient);
const authKey = 'TestAuthKey';

// this an example hanlder for API Gateway HTTP events, you can find the full list of handlers here: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda/trigger
export const get: APIGatewayProxyHandlerV2 = async (event:any) => {
  console.log(event);

 
  if ( !event.queryStringParameters || !event.queryStringParameters.authKey || event.queryStringParameters.authKey != authKey)
  {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid authentication key' })
    }
  }

  if (!event.queryStringParameters || !event.queryStringParameters.poll)
  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Missing poll id information' })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ result: await voteService.computeResults(event.queryStringParameters.poll)})
  };
};