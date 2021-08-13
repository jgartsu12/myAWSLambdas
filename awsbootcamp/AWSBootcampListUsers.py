import boto3
import os
def lambda_handler(event, context):
    client = boto3.client('connect')
    response = client.list_users(
        InstanceId = os.environ['InstanceId'] #ac instance id
        #NextToken='string',
        #MaxResults=123
    )
    print(response)
    return ('Success')