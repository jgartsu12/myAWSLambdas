import boto3
import os

def lambda_handler(event, context):
    connect = boto3.client('connect')
    response = connect.start_outbound_voice_contact(
        Attributes={'Name': 'Jose Butterflies'}, #attributes to attach to contact flow to act on
        DestinationPhoneNumber = os.environ['DestinationPhoneNumber'], #number to call
        ContactFlowId = os.environ['ContactFlowId'], # AC contact flow to invoke change
        SourcePhoneNumber = os.environ['SourcePhoneNumber'], #AC number to display. must be in your instance and in E.164 format
        InstanceId = os.environ['InstanceId'] # AC instance id
    )
    return ('Success')