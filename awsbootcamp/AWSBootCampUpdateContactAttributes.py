import boto3
import os

def lambda_handler(event, context):
    connect = boto3.client('connect')
    response = connect.update_contact_attributes(
        InitialContactId = os.environ['InitialContactId'],#AC contact id
        InstanceId = os.environ['InstanceId'], # AC instance id
        Attributes={'Status': 'Case Closed'} #attributes to add
        )
    return ('Success')