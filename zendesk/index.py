# create ticket in zendesk via lex bot
import logging
import boto3
import json
from boto3.dynamodb.conditions import Key
from zendesk import Zendesk

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# get svc resource
dynamo = boto3.resource('dynamodb')

# instantiate table resource obj
db_table = dynamo.Table('dynamotableA')
br_table = dynamo.Table('dynamotableB')

def lambda_handler(event,context):
    logger.debug(json.dumps(event))
    logger.debug('event.bot.name={}'.format(event['bot']['name']))
    logger.debug('dispatch userId={}, intentName={}'.format(event['userId'], event['currentIntent']['name']))
    logger.debug('entire.event={}'.format(event))

    # validate intent name
    intent_name = event['currentIntent']['name']
    if intent_name != 'lexbotintent':
        raise Exception('Intent with name ' + intent_name + ' not supported!')

    # source validation
    source = event['invocationSource']
    if source == 'DialogCodeHook':
        raise Exception('Lambda function only support fulfillment')

    # get bot slot values
    issue = event['currentIntent']['slots']['issue']
    prioritytype = event['currentIntent']['slots']['prioritytype']


# get customernumber from ddb table
    response = br_table.query(
        TableName = 'dynamotableB',
        IndexName='constant-timestamp-index',
        Select='ALL_ATTRIBUTES',
        Limit=1,
        ConsistentRead=False,
        ScanIndexForward=False,
        KeyConditionExpression=Key("constant").eq("a")
    )
    phoneNumber = response['Items'][0]['phoneNumber']

    update_resp = db_table.update_item(
        Key={
            'phoneNumber': phoneNumber
        },
        UpdateExpression= 'SET issue = :issue, prioritytype= :prioritytype',
        ExpressionAttributeValues={
            ':prioritytype': prioritytype,
            ':issue':issue
        }
    )

    get_customer_info = db_table.get_item(
        TableName='dynamotableA',
        Key={
            "phoneNumber": phoneNumber
        },
    )['Item']

    # create ticket in zdesk w/ ddb and lexbot values
    SSM_CLIENT = boto3.client('ssm')
    zd_secret = SSM_CLIENT.get_parameter(
        Name='ssm_secret_key_name',
        WithDecryption=True
    )['Parameter']['Value']
    zendesk = Zendesk('cozendeskurl', 'zendesk_user_email', zd_secret, True)
    new_ticket = {
        'ticket': {
            'requester': {
                'name': get_customer_info['firstName'],
                'email': get_customer_info['prioritytype']
            },
            'subject': 'Ticket Subject Here',
            'description':get_customer_info['issue'],
            'tags': ['key1','value1'],
            'priority': get_customer_info['prioritytype']
        }
    }
    zd = zendesk.ticket_create(data=new_ticket)
    logger.debug(zd)

    intent_fulfillment_response = { 'sessionAttributes':event['sessionAttributes'],
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': 'Fulfilled',
            'message': {
                'contentType': 'SSML',
                # message content to return to the lex bot
                'content': 'Thank you! A ticket was sucessfully created. An agent will be with you soon!'
            }
        }
    }

    return intent_fulfillment_response