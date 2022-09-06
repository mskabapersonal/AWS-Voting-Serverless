import {DynamoDB} from "aws-sdk";
import {DynamoDBStreamHandler} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import VoteService from "../../../database/services/VoteService";

const dynamoDBClient:DocumentClient = new DynamoDB.DocumentClient();
const voteService = new VoteService(dynamoDBClient);

//https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.Tutorial.html
export const handler: DynamoDBStreamHandler = async ({ Records: records }) => {
  console.log(records);

  for (const record of records) {
    await voteService.updatePollResult(record);
  }

}