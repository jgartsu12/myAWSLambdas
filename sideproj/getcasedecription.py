# lambda built for agent whisper flow to play description of case while agent waits for customer
#  maps phone number to cases table in ddb and returns description

import json
import boto3
import os

tableName = os.environ['tableName']
ddb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    phoneNumber = event['Details']['ContactData']['CustomerEndpoint']['Address']
    # print(event)
    # print(phoneNumber)

    table = ddb.Table(tableName) 
    response = table.get_item(Key={'phoneNumber': phoneNumber})

    if 'Item' in response:
        description = response['Item']['description']
        
        return description
        
    else:
        return 'failed'