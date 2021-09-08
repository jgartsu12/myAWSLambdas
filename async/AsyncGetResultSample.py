import json, boto3, os

def lambda_handler(event, context):
    
    #Establish response container
    response = {}
    #Extract contact id from incoming event
    extracted_contact_id = event["Details"]["ContactData"]["ContactId"]
    
    #Define the DynamoDB Config
    dynamodb_client = boto3.resource('dynamodb')
    dynamodb_tracker_table = dynamodb_client.Table(os.environ['tracker_table_name'])
    
    #Perform the search based on extracted contact ID
    try:
        lookup = dynamodb_tracker_table.get_item(
            Key={
                'contact_id' : extracted_contact_id
            }
        )
        response.update({'dbquery_status': 'success'})
        
        #If we found a record, check for processing
        if 'Item' in lookup:
            tracker = lookup['Item']
            
            if tracker['has_processed'] == 1:
                #If it has completed, add the full record to the response and return complete
                response.update(tracker)
                response.update({'dbquery_status': 'found'})
                response.update({'async_status':'complete'})
                
            else:
                #If it has not completed, return incomplete
                response.update({'async_status':'incomplete'})
    
        #if we didnt find a record, return not found
        else:
            response.update({'async_status': 'not_found'})
        
    except: 
        response.update({'async_status': 'fail'})
    
    

    return response