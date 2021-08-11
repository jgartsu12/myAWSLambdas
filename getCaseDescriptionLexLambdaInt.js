// in lex v2 bot, this lambda is integrated in the lex fullfillment block 

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    var caseID = parseInt(event.inputTranscript) ;
    console.log("Event", event);
    var paramsQuery = {
        TableName: 'existingCases',
        KeyConditionExpression: "caseID = :varNumber",
        IndexName: "caseID-index",
    
     ExpressionAttributeValues: {
         ":varNumber": caseID
        }
    };

 docClient.query(paramsQuery, function(err, data) {
    if (err) {
        console.log(err); // an error occurred
        context.fail(buildResponse(false));
    } else {
        console.log("DynamoDB Query Results:" + JSON.stringify(data));
        if (data.Items.length === 1) {
            console.log(data.Items[0].caseDescription);
            var caseDescription = data.Items[0].caseDescription;
            callback(null, buildResponse(true, caseDescription));
        }
        else {
console.log("caseID not found");
callback(null, buildResponse(true, "none"));
}
}
});
};

function buildResponse(isSuccess, caseDescription) {
if (isSuccess) {
return {
"sessionState": {
"dialogAction": {
"type": "Close"
},
"intent": {
"confirmationState": "Confirmed",
"name": "IntentName",
"state": "Fulfilled",
},
},
"messages": [
{
"contentType": "PlainText",
"content": "Your case description is: " + caseDescription,
}
]
};
}
else {
console.log("Lambda returned error to Connect");
return { lambdaResult: "Error" };
}
}