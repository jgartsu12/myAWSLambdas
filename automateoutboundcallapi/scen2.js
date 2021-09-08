/*Scenario 2

The StartOutboundVoiceContact parameter has a defined queueID value, and the target contact flow has defined Transfer to queue and Set working queue blocks.

Result
The call goes to the queue specified by the Set working queue block. 
The queueID value passed from the API only defines the caller ID that is presented to the caller. 
If the caller is queued, the contact flow block defines the queue.

Use case
This procedure is used to put callers in a queue for an agent after Amazon Connect has called them. 
The queue is specifically defined in the target contact flow. 
In this case, the API queueID parameter is only used for caller ID, allowing you to dynamically 
present your callers with different phone numbers.

To make sure that callers see a local number from their country, ou can use your website’s console, 
as long as it supports different AWS Regions. If a particular queue only services one AWS Region, 
this feature is not an option, because Amazon Connect relies on the queue’s static caller ID to display 
a caller ID.
*/

const AWS = require('aws-sdk');
var connect = new AWS.Connect();
// main entry to the flow

exports.handler = (event, context, callback) => {
    //define parameter values to use in initiating the outbound call

    var params = {
        ContactFlowId: "422803f7-db08-4a02-9227-0d873d7b3ed5",
        DestinationPhoneNumber: "+14752254262",
        InstanceId: "cdb75e29-fce6-49c2-b755-7be7d03a9f50",
        QueueId: "9b51b94c-2605-42d6-8c1c-75551c4fc1d0",
        // Attributes: {"Name": "MyAttribute"},
        // SourcePhoneNumber: "+18555221202"
    };

    // method used to initiate the outbound call from Amazon Connect
    connect.startOutboundVoiceContact(params, function(err, data) {
        if (err) console.log(err, err.stack) ;
        else console.log(data);
    });

    callback(null, event);

};