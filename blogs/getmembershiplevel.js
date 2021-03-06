// using phoneNumber create personal greeting depending on there membership level

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
	var phoneNumber = event.Details.ContactData.CustomerEndpoint.Address;
	var paramsQuery = {
				TableName: 'membershipTable',
  				KeyConditionExpression: "phoneNumber = :varNumber",
  				IndexName: "phoneNumber-index",

  				ExpressionAttributeValues: {
   					":varNumber": phoneNumber
  				}
 			};

	docClient.query(paramsQuery, function(err, data) {
  		if (err) {
   			console.log(err); // an error occurred
   			context.fail(buildResponse(false));
  		} 
		else {
   			console.log("DynamoDB Query Results:" + JSON.stringify(data));
			
   			if (data.Items.length === 1) {
				console.log(data.Items[0].membershipLevel);
				var membershipLevel = data.Items[0].membershipLevel;
				callback(null, buildResponse(true, membershipLevel));
   			} 
			else {
    			console.log("PhoneNumber not found");
    			callback(null, buildResponse(true, "none"));
   			}
  		}
 	});
};

function buildResponse(isSuccess, membershipLevel) {
 	if (isSuccess) {
  		return { 
			membershipLevel: membershipLevel,
			lambdaResult: "Success"
		};
 	} 
	else {
  		console.log("Lambda returned error to Connect");
  		return { lambdaResult: "Error" };
 	}
}