//set up the database query for dateNow time between dateStart and dateEnd
  var holidayScanningParams ={
      //DynamoDB Table Name.  Replace with your table name
      TableName:process.env.tableName,
      Limit:100,
      FilterExpression: ":dateNow between StartDateTime and EndDateTime",
      ExpressionAttributeValues: {
        ":dateNow": Date.now()
    }
   };
  console.log(JSON.stringify(holidayScanningParams));
  //use the database scan we just defined 
  docClient.scan(holidayScanningParams, function(err,data){
      //if scan did not find dateNow between dateStart and dateEnd, log no holiday found, set value to False
      if(err){
          callback(null, buildResponse(false));
      }else{
          if(data.Items[0] == null){
            console.log("Found no holidays in HolidayCheck");
            callback(null, buildResponse(true, "False"));
          }
          //if scan finds dateNow between dateStart and dateEnd set response to True
          else{
            callback(null, buildResponse(true, "True", data.Items[0].Reason));
          }
      }
    });
  };
    
//This is the function that will be called if scan returns True
function buildResponse(isSuccess, holidayFound, holidayMessage) {
  if (isSuccess) {
    return {
      //These key names are used in the contact attributes block within the Contact Flows
      holidayFound: holidayFound,
      holidayMessage: holidayMessage,
      lambdaResult: "Success"
    };
  }
  else {
    console.log("Lambda returned error to Connect");
    return { lambdaResult: "Error" };
  }
}