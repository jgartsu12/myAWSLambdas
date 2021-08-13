'use strict'
const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1" });

// function
//event object - what triggers lambda function
// context obj - info about the invoking lambda in exec 
// callback 
exports.handler = function (event, context, callback) {
    // instantiate instance of dynanmoDB service obj
    const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
    // param obj - describe item we want to pull from in ddb
    const params = {
        TableName: "Users",
        Key: {
            "id":{
                S:"12345"
            }
        }
    }
    // getItem function
    ddb.getItem(params, (err, data) => {
        if(err) {
            console.log(err);
        }
        console.log(data);
    });
}