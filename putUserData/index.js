// add user to ddb table using nodejs lambda

'use strict'
const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event, context) =>  {
    const params = {
        TableName: "Users",
        Key: {
            id: "12345",
            firstname: "Jay",
            lastname: "Lewis"     
        }
    }
    try {
        const data = await docClient.put(params).promise();
        console.log(data);
    } catch (err) {
        console.log(err);
    };
}