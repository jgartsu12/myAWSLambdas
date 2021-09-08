import json, boto3, time, os

def lambda_handler(event, context):

    
    #Establish the event response container
    event_response = {}
    
    #Check incoming record to see if it is an Insert
    for Record in event['Records']:
        if Record['eventName'] == 'INSERT' and Record['dynamodb']['NewImage']['has_processed']['N'] == '0':
            
            #Establish the async data container
            async_data = {}
            
            #Load the tracker data
            incoming_item_params = Record['dynamodb']['NewImage']
            boto3.resource('dynamodb')
            deserializer = boto3.dynamodb.types.TypeDeserializer()
            loaded_params = {k: deserializer.deserialize(v) for k,v in incoming_item_params.items()}
            async_data.update(loaded_params)
            
            #Generate the TTL
            ttlEpochTime = round(time.time())+int(os.environ['item_timeout'])
            async_data.update(
                {
                    'item_ttl': ttlEpochTime,
                    'has_processed': 1
                }
            )

            ########## Start Your Async Code ##########
            
            #You can reference your passed params like so: 
            print(async_data['contact_id'])
            
            #Fake response with delay
            async_data.update({'payment_confirmation':'OU','result':'success'})
            time.sleep(15)
                
            ########## End Your Async Code ##########
            
            if async_data['result'] == 'success':
                
                try:
                    #Define the DynamoDB Config
                    dynamodb_client = boto3.resource('dynamodb')
                    dynamodb_tracker_table = dynamodb_client.Table(os.environ['tracker_table_name'])
                    
                    #Update the tracker table
                    async_update = dynamodb_tracker_table.put_item(
                        Item = async_data
                    )
                    event_response.update({'status':'complete','result':'updated'})
                    
                except: 
                    event_response.update({'status':'incomplete','result':'failed_tracker_update'})
                    
            else:
                event_response.update(async_data)
                event_response.update({'status':'incomplete','result':'api_function_fail'})
    
        else:
            event_response.update({'job_status':'complete','job_result':'no_more_records_to_process'})

    return event_response