# MIT No Attribution

# Copyright 2021 AWS

# Permission is hereby granted, free of charge, to any person obtaining a copy of this
# software and associated documentation files (the "Software"), to deal in the Software
# without restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# not production code just training
# import libraries and set table name
# import libraries and set table name
import json
import boto3
import os

tableName = os.environ['tableName']
ddb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    
    # cs phone number passed from AC via JSON
    phoneNumber = event['Details']['ContactData']['CustomerEndpoint']['Address']

    # cs lookup to DynamoDB via customer phonenumber
    table = ddb.Table(tableName) # ddb is var name, not dynamoDB ... also: needs to be uppercase T in Table not table
    response = table.get_item(Key={'phoneNumber': phoneNumber})

    # if record exists, write these values to variables
    if 'Item' in response:
        caseNumber = response['Item']['caseNumber']
        DOB = response['Item']['DOB']
        fName = response['Item']['fName']
        lName = response['Item']['lName']
        status = response['Item']['status']
        lastAgent = response['Item']['lastAgent']
        caseNotes = response['Item']['caseNotes']

        # return variable to AC
        return {
            'message': 'Success',
            'caseNumber': caseNumber,
            'DOB': DOB,
            'fName': fName,
            'lName': lName,
            'status': status,
            'caseNotes': caseNotes,
            'lastAgent': lastAgent
        }
    
    # if there is not a match, return this default message
    else:
        return {'message':'Fail'} 
