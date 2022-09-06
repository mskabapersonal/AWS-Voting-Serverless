# AWS-Voting-Serverless
Voting example using AWS Serverless stack (Lambda + Dynamo)

## To create the stack

### 1. Compile: 
```
npm run webpack 
```

### 2. Deploy
```
sam deploy --stack-name <stack-name> --s3-bucket <bucket> --capabilities CAPABILITY_NAMED_IAM
```

### 3. Create voting configuration

#### 3.1 Windows
```
aws dynamodb put-item --table-name voting-config-table --item "{\"poll\": { \"S\": \"W52\" },\"config\":{\"M\": {\"end_time\": {\"N\": \"1640880719000\"},\"start_time\": {\"N\": \"1640103119000\"},\"candidates\": {\"L\": [{\"S\": \"Marcelo1\"}, {\"S\": \"Marcelo2\"},{\"S\": \"Marcelo3\"}]}}}}"
```

#### 3.2 Linux
```
aws dynamodb put-item --table-name voting-config-table --item '{"poll": { "S": "W52" },"config":{"M": {"end_time": {"N": "1640880719000"},"start_time": {"N": "1640103119000"},"candidates": {"L": [{"S": "Marcelo1"}, {"S": "Marcelo2"},{"S": "Marcelo3"}]}}}}'
```

## Usage

### 1. Vote
Endpoint:  `<your endpoint>/Prod/vote`

Body:
```
{
    "email": "marcelo14@test.w52", ==> Email of the person voting
    "votedFor": "Marcelo3", ==> Who are you voting for: must be in the list inputed in the configuration
    "poll": "W52" ==> The poll ID
}
```

Response: // Even if the vote is not counted, we will send this response
```
{
    "result": "Processed."
}
```

### 2. Results
Endpoint: `<your endpoint>/Prod/results`

Example: `<your endpoint>/Prod/results?authKey=TestAuthKey&poll=W52`

Response: ==> Each candidate appears in the result, including the ones with 0 votes
```
{
    "result": [
        {
            "candidate": "Marcelo1",
            "votes": 4
        },
        {
            "candidate": "Marcelo2",
            "votes": 3
        },
        {
            "candidate": "Marcelo3",
            "votes": 2
        }
    ]
}
```