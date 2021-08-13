// add user to ddb table using nodejs lambda

'use strict'
const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) =>  {
    const params = {
        TableName: "Users",
        //debugged error: MissingRequiredParameter: Missing required key 'Item' in params (needed to be Item not Key sense we are Putting/Adding item)
        // when excuted, because I didnt change the id to an unique identifier it changed the first & last name of that id from Bob Jone to Jay Lewis
       // changing the id worked and added new item
        Item: {
            id: "12345",
            firstname: "Jay",
            lastname: "Lewis"    
                    // in console looks like {} and null because not returning a value
 
        }
    }
    try {
        const data = await docClient.put(params).promise();
        console.log(data);
    } catch (err) {
        console.log(err);
    };
}