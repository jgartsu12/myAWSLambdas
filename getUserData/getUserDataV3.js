// using async await instead of tradition call back
// aws sdk looks for globally defined promised function, if it finds it adds promise utility method to aws utility request objects
// promise  can be called on any utility method (get, put, etc...) to permisfy it use with asyncAwait
'use strict'
const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

// made async with arrow function
exports.handler = async (event, context) =>  {
    const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
    const params = {
        TableName: "Users",
        Key: {
            id: "12345"     
        }
    }
    try {
        const data = await docClient.get(params).promise();
        console.log(data);
    } catch (err) {
        console.log(err);
    };
}