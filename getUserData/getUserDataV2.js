// use documentclient so you dont have to specify the data type for the dynamoDB Json, unmarshall our ddb json to standard json

'use strict'
const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1" });


exports.handler = function (event, context, callback) {
    const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
    const documentClient = new AWS.DynamoDB.documentClient({ region: "us-east-1" });
    const params = {
        TableName: "Users",
        Key: {
            id: "12345"     
        }
    }
    // with docuclient syntax is just get not getItem()
    documentClient.get(params, (err, data) => {
        if(err) {
            console.log(err);
        }
        console.log(data);
    });
}