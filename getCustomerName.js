/* aws lambda function to match contact attribute 
through phone number to get customer name for play prompt greet */

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    var phoneNumber = event.Details.ContactData.CustomerEndpoint.Address;
    var paramsQuery = {
        TableName: 'abcCustomersTestTable',
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
                console.log(data.Items[0].customerName); 
                var customerName = data.Items[0].customerName;
                callback(null, buildResponse(true, customerName));
            }
            else {
                console.log('phoneNumber doesnt match');
                callback(null, buildResponse(true, 'none'))
            }
        }
    });
};

function buildResponse(isSuccess, customerName) {
    if (isSuccess) {
        return {
            customerName: customerName,
            lambdaResult: 'Success'
        };
    }
    else {
        console.log('Lambda returned error to Connect');
        return { lambdaResult: 'Error' };
    }
}