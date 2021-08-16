from botocore.vendored import requests
import json
import os

def lambda_handler(event, context):
    print(event)
    details = event["Details"]
    parameters = details['Parameters']
    zipcode = parameters['zipcode']
    # validate zip is correct format
    if str.isdigit(zipcode) and len(zipcode)==5:
        pass
    else:
        return{
            'Success':'False'
        }
    # GET request to REST endpoint
    url = 'http://api.openweathermap.org/data/2.5/weather'
    APPID = os.environ["APPID"]
    parameters = {
        "zip":zipcode+",us",
        "APPID":APPID,
        "units":"Imperial"
    }

    try:
        resp = requests.get(url,params=parameters)
        if resp.status_code != 200:
            # error
            print('error occured')

            return{
                'Success':'False'
            }
        else:
            response=json.loads(resp.text)
            weather=response['weather'][0]['description']
            temp=response['main']['temp']
            place=response['name']
            wind=response['wind']['speed']
            msg=json.loads(resp.text)
            print(msg)

            return{
                'Success':'True',
                'weather':weather,
                'temperature': temp,
                'place':place,
                'wind':wind
            }
    except:
        return{
            'Success':'False'
        }