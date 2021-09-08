/* scenario 1
call goes to the queue defined by the queueID param in api request
queueID value defines the que implicity the outbound caller ID, which
the transfer to queue block uses to route caller via the c flow
*/

/* use case
add callers to specific queue dynamically depending on source
reassignmnt removes need to specify que in target c flow
queue id defines the number that the caller sees on their phone

example:
caller requests an outbound call with a call me button, you reassign the calls queue based on the type of inquiry like support or billing
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