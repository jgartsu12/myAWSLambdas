# AWSBootcamplastAgentUpdate

import json
import boto3
import os

tableName = os.environ['tableName'] #this env variable in set in AWS Lambda services in the config section
ddb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    
    # cs phone number passed from AC via JSON
    phoneNumber = event['Details']['ContactData']['CustomerEndpoint']['Address']
    # customers lastAgent they spoked to passed from AC via JSON
    lastAgent = event['Details']['ContactData']['Attributes']['lastAgent']

    # cs lookup to DynamoDB via customer phonenumber
    table = ddb.table(tableName) #configured in aws
    response = table.get_item(Key={'phoneNumber': phoneNumber})

    # if record exists, write these values to variables
    if 'Item' in response:
        table.update_item(
            Key={'phoneNumber':phoneNumber},
            UpdateExpression="SET lastAgent =:var",
            ExpressionAttributeValues={':var': lastAgent}
        )
        return {'message':'updated'}

    # if no record exists, create a new record with the phone number and last agent field
    else:
        table.put_item(
            Item={
                "phoneNumber": "" + phoneNumber + "",
                "lastAgent": "" + lastAgent + "",
            }
        )
        return {'message': 'added'}