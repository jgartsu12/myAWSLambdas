'use strict'

var aws = require('aws-sdk');
var ddb = new aws.DynamoDB();

exports.handler = function getCaseDescription(event, context, callback){
    console.log(event.Details.Parameters.caseID);

    var params = {
        TableName: 'existingCases',
        Key: {
            'caseID': { N: event.Details.Parameters.caseID }
        }
    };

    ddb.getItem(params, function(err, data) {
        if(err){
            callback(err, null);
        }else{
            var resultsMap = {
                'caseID':data.Item.caseID.N.toString(),
                'caseDescription': data.Item.caseDescription.S
            };
            console.log(resultsMap);
            callback(null,resultsMap);
        }
    });
}