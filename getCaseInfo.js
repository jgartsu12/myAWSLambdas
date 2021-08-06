// aws lambda function to retrieve existing caseDescription from cases table in dyanmo db

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    var caseID = event.Details.ContactData.CustomerEndpoint.Address;
    var paramsQuery = {
        TableName: 'cases',
        KeyConditionExpression: 'caseID = :varString',
        IndexName: 'caseID-index',

        ExpressionAttributeValues: {
            ':varString': caseID
        }
    };

    docClient.query(paramsQuery, function(err, data) {
        if (err) {
            console.log(err); //if error occurs print error to console
            context.fail(buildResponse(false));
        }
        else {
            console.log("DynamoDB Query Results:" + JSON.stringify(data)); 
            
            if (data.Items.length === 1) {
                console.log(data.Items[0].caseDescription); 
                var caseDescription = data.Items[0].caseDescription;
                callback(null, buildResponse(true, caseDescription));
            }
            else {
                console.log('caseID doesnt match or exist');
                callback(null, buildResponse(true, 'none'))
            }
        }
    });
};

function buildResponse(isSuccess, caseDescription) {
    if (isSuccess) {
        return {
            caseDescription: caseDescription,
            lambdaResult: 'Success'
        };
    }
    else {
        console.log('Lambda returned error to Connect');
        return { lambdaResult: 'Error' };
    }
};