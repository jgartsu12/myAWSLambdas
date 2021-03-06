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
        Attributes: {"Name": "MyAttribute"},
        SourcePhoneNumber: "+18555221202"
    };

    // method used to initiate the outbound call from Amazon Connect
    connect.startOutboundVoiceContact(params, function(err, data) {
        if (err) console.log(err, err.stack) ;
        else console.log(data);
    });

    callback(null, event);

};