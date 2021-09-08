import json, boto3, time, os

def lambda_handler(event, context):
    
    #Establish tracker and response containers
    tracker_item = {}
    response = {}
    
    #Update the tracker item with the required tracker data
    tracker_item.update(
        {
            'contact_id': event['Details']['ContactData']['ContactId'],
            'has_processed': 0
        }
    )
    
    #Update the tracker item with the passed Parameters
    tracker_item.update(event['Details']['Parameters'])
    
    #Define DB connection
    dynamodb_client = boto3.resource('dynamodb')
    dynamodb_table = dynamodb_client.Table(os.environ['tracker_table_name'])
    
    #define the put with data
    try:
        async_write = dynamodb_table.put_item(
            Item = tracker_item
        )
        response.update({'is_processing': 'true'})
    
    except:
        response.update({'is_processing': 'false'})
        
    #Send the response back
    return response