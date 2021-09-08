/*
Scenario 3
The queueID is not set in the StartOutboundVoiceContact API parameter, and the target contact flow has neither the Transfer to queue or Set working queue block defined.

Result
The SourcePhoneNumber value must be specified. Otherwise, the API call fails. This is because Connect uses the queue to define the caller ID, as described in the preceding Scenarios 1 and 2.
If SourcePhoneNumber is not defined, you must pass the SourcePhoneNumber parameter so that there is a caller ID to use. If you take this approach, the call is not queued on an inbound queue. Without queueing the caller, Connect dials outbound to your customer, runs them through the given contact flow, and either disconnects or performs the action defined in the content flow.

Use case
Don’t queue your callers to speak to an agent—just have them listen to the target contact flow and dynamically present different caller IDs based on the SourcePhoneNumber parameter. An example might include calling your customers to notify them about an appointment using a phone number that’s local to them.
This use case is good for calls during which users don’t need to speak to an agent, such as automated reminders or notifications. There’s no need to change your queue configuration in Connect every time you want to show a different caller ID.
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
        // QueueId: "9b51b94c-2605-42d6-8c1c-75551c4fc1d0",
        // Attributes: {"Name": "MyAttribute"},
        SourcePhoneNumber: "+18555221202"
    };

    // method used to initiate the outbound call from Amazon Connect
    connect.startOutboundVoiceContact(params, function(err, data) {
        if (err) console.log(err, err.stack) ;
        else console.log(data);
    });

    callback(null, event);

};