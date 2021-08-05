// aws lambda function to get customer information from dyanamoDB to use for greeting in connect

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    var phoneNumber = event.Details.ContactData.CustomerEndpoint.Address;
    var paramsQuery = {
        TableName: 'abcCustomersTable',
        KeyConditionExpression: 'phoneNumber = :varString',
        IndexName: 'phoneNumber-index',

        ExpressionAttributeValues: {
            ':varString': phoneNumber
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
                console.log(data.Items[0].customerPlan); 
                var customerPlan = data.Items[0].customerPlan;
                callback(null, buildResponse(true, customerPlan));
            }
            else {
                console.log('phoneNumber doesnt match ');
                callback(null, buildResponse(true, 'none'))
            }
        }
    });
};

function buildResponse(isSuccess, customerPlan) {
    if (isSuccess) {
        return {
            customerPlan: customerPlan,
            lambdaResult: 'Success'
        };
    }
    else {
        console.log('Lambda returned error to Connect');
        return { lambdaResult: 'Error' };
    }
}