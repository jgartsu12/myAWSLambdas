"use strict";

const AWS = require("aws-sdk");
//Set the right region context
var awsRegion = process.env.REGION;
if (awsRegion)
{
  AWS.config.update({region: awsRegion});
}
//Create ddb client
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => 
{
  console.log('DEBUG:Entered messageRetriever Lambda with event:', JSON.stringify(event, null, 2));
  
  //Initialize the output response intended for Amazon Connect flow
  var response = {};
 
  //extract from Connect to Lambda event header
  var ani = event.Details.ContactData.CustomerEndpoint.Address;
  var dnis = event.Details.ContactData.SystemEndpoint.Address;
  //input parameters from Connect  
  var language = event.Details.Parameters.inLanguage;
  var messageGroup = event.Details.Parameters.inMessageGroup;
  console.log("DEBUG:DNIS:" + dnis +"|ANI:" + ani + "|language:" + language + "|messageGroup:" + messageGroup);
 
  getLocalisationMessages();
 
  //Function to load the appropriate messages for this language and messageGroup
  function getLocalisationMessages() 
  {
    var ddbParams = 
    {
      TableName: process.env.MSG_TABLE_NAME,
      Key: 
      {
        MsgGroup: messageGroup
      }
    };
 
    dynamodb.get(ddbParams, function(err, data) 
    {
      if (err) 
      {
        console.error("Error getting localisation messages: " + err);
        invokeCallbackFunction(null);
      } 
      else 
      {
        if (data && data.Item)
        {
          //Retrieve static messages 
          var staticMessages = data.Item.Messages.Static;
          if (staticMessages && staticMessages.length > 0) 
          {
            staticMessages.forEach(m => 
            {
              var MsgID = m.MsgId;
              if (m.MsgText[language] != null && m.MsgText[language] != "") 
              {
                response[MsgID] = m.MsgText[language];
              } 
              else 
              {
                response[MsgID] = "<speak></speak>";
              }
            });
          }
          
          //Retrieve situational messages and only those that are enabled
          var situationalMessages = data.Item.Messages.Situational;
          if (situationalMessages && situationalMessages.length > 0) 
          {
            situationalMessages.forEach(m => 
            {
              var MsgID = m.MsgDetail.MsgId;
              if ((m.Enabled == "true" || m.Enabled) && m.MsgDetail.MsgText[language] != "") 
              {
                response[MsgID] = m.MsgDetail.MsgText[language];
              } else 
              {
                response[MsgID] = "<speak></speak>";
              }
            });
          }
        }
        else
        {
          //Message group not configured in DDB and query returns empty objects
          console.error("Messages dont exist for this message group in the DDB table: " + messageGroup);
          invokeCallbackFunction(null);
        }
      }
      
      invokeCallbackFunction(response);
    });
  }
 
  function invokeCallbackFunction(ResultObj) 
  {
    console.log("response from messageRetriever Lambda: " + JSON.stringify(ResultObj));
    if (ResultObj != null)
    {
      ResultObj.statusCode = 200;
    }
    
    callback(null, ResultObj);
  }
  
};