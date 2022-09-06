import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyHandlerV2} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import VoteService from "../../../database/services/VoteService";

const dynamoDBClient:DocumentClient = new DynamoDB.DocumentClient();
const voteService = new VoteService(dynamoDBClient);

// this an example hanlder for API Gateway HTTP events, you can find the full list of handlers here: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda/trigger
export const post: APIGatewayProxyHandlerV2 = async (event:any) => {
  console.log(event);
  var body = JSON.parse(event.body);
  console.log (body);  

  if (!body.poll)
  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Missing poll id information' })
    }
  }
  if (!body.email)
  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Missing email information' })
    }
  }
  if (!body.votedFor)
  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Candidate information' })
    }
  }

  // Check if we are inside voting period and if the request has a valid candidate
  if (await voteService.validateVote(body))
  {
    await voteService.createVote(body); 
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ result: "Processed." })
  };
};

// Crud example: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html