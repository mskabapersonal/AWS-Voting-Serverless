import { DocumentClient } from "aws-sdk/clients/dynamodb";
import SingleVote from "../models/SingleVote";

class VoteService {
    constructor(
      private readonly docClient: DocumentClient,
    ) {}

    private readonly VOTE_TABLE_NAME: string = "vote-table";
    private readonly TOTALS_TABLE_NAME: string = "voting-total-table";
    private readonly CONFIG_TABLE_NAME: string = "voting-config-table";

    async validateVote(vote: any): Promise<boolean> {
      var candidates: string[] = [];
      var config_response = {start_time: 99999999999999, end_time: 0, candidates: candidates};

      // Get configuration
      await this.docClient.get(
        {
          TableName: this.CONFIG_TABLE_NAME,
        Key: {
          poll: vote.poll
        }
        })
        .promise().then(function(response:any) {
          console.log(response.Item);
          if (response.Item === undefined) return false;
          config_response = response.Item.config;
        })
        .catch( function(error:any) {
          console.error(error);
          return false;
        });

      // Check valid time and Check valid candidate
      return ((new Date()).getTime() >= config_response.start_time &&
              (new Date()).getTime() <= config_response.end_time &&
              config_response.candidates.indexOf(vote.votedFor) >= 0
      );
    }

    async createVote(vote: any): Promise<boolean> {
      // Create the vote
      var singleVote:SingleVote = {
        poll: vote.poll, 
        timestamp: Date(),
        email: vote.email,
        votedFor: vote.votedFor
      };

      try
      {
        // Save to DynamoDB
        await this.docClient
          .put({
            TableName: this.VOTE_TABLE_NAME,
            Item: {
              PollEmail: vote.poll+"#"+vote.email,
              vote: singleVote},
            ExpressionAttributeNames: { '#key': 'PollEmail' },
            ConditionExpression: 'attribute_not_exists(#key)'
          })
          .promise().then(
            function(data:any) {
              console.log(data)
            })
          .catch( 
            function(error:any) {
              console.error(error);
              return false;
            });
        } catch(e) {
          console.log(e);
        }
      return true;
    }

    async updatePollResult(vote: any): Promise<boolean> {
      if (vote.eventName != 'INSERT') return true;

      console.log(vote.dynamodb.NewImage.vote.M.poll.S);
      console.log(vote.dynamodb.NewImage.vote.M.votedFor.S);

      try
      {
        // Save to DynamoDB
        await this.docClient
          .update({
            TableName: this.TOTALS_TABLE_NAME,
            Key: {votePollCandidate: vote.dynamodb.NewImage.vote.M.poll.S+"#"+vote.dynamodb.NewImage.vote.M.votedFor.S},
            UpdateExpression: 'SET votes = if_not_exists(votes, :ca) + :num',
            ExpressionAttributeValues: {
                ':num': 1,
                ':ca': 0
            }
          })
          .promise().then(
            function(data:any) {
              console.log(data)
            })
          .catch( 
            function(error:any) {
              console.error(error);
              return false;
            });
        } catch(e) {
          console.log(e);
        }
      return true;
    }

    async computeResults(poll: any): Promise<any> {
      var candidates: string[] = [];
      var config_response = {start_time: 99999999999999, end_time: 0, candidates: candidates};

      // Get candidates for the poll
      await this.docClient.get(
        {
          TableName: this.CONFIG_TABLE_NAME,
        Key: {
          poll: poll
        }
        })
        .promise().then(function(response:any) {
          console.log(response.Item);
          if (response.Item === undefined) return [];
          config_response = response.Item.config;
        })
        .catch( function(error:any) {
          console.error(error);
          return null;
        });


      var result: any[] = [];
      for (const candidate of config_response.candidates)
      {
        var votes = 0;
        await this.docClient.get(
          {
            TableName: this.TOTALS_TABLE_NAME,
          Key: {
            votePollCandidate: poll+"#"+candidate
          }
          })
          .promise().then(function(response:any) {
            console.log(response.Item);
            if (response.Item !== undefined) {
              votes = response.Item.votes;
            }
            result.push({candidate: candidate, votes: votes})
          })
          .catch( function(error:any) {
            console.error(error);
          });
      }

      return result;
    }

  }

export default VoteService;