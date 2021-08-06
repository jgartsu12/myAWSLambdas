// aws lambda function to retrieve existing caseDescription from cases table in dyanmo db
'use strict'

var AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB();

exports.handler = function getOrder(event, context, callback){
    console.log(event.Details.Parameters.caseID);
    var params = {
        TableName: 'cases',
        Key: {
            'caseID':{ N: event.Details.Parameters.caseID }
        }
    };

    dynamodb.getItem(params, function(err, data){
        if(err){
            callback(err,null);
        } else {
            var resultMap = {
                'caseID': data.Item.caseID.S,
                'caseDescription': data.Item.caseDescription.S,
            };
            console.log(resultMap);
            callback(null, resultMap);
        }
    });
};