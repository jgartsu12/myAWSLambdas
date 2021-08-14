const aws = require("aws-sdk");
const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json"
    };

    try {
        switch (event.routeKey) {
            case "Delete /items/{id}":
                await ddb 
                    .delete({
                        TableName: "portfolio",
                        Key: {
                            id: event.pathParameters.id 
                        }
                    })
                    .promise();
                break;
            case "GET /items":
                body = await ddb.scan({ TableName: "portfolio" }).promise();
                break;
            case "PUT /items":
                let requestJSON = JSON.parse(event.body);
                await ddb
                    .put({
                        TableName: "portfolio",
                        Item: {
                            id: requestJSON.id,
                            banner_image_url: requestJSON.banner_image_url,
                            category: requestJSON.category,
                            logo_url: requestJSON.logo_url,
                            name: requestJSON.name,
                            position: requestJSON.position,
                            thumb_image_url: requestJSON.thumb_image_url,
                            url: requestJSON.url
                        }
                    })
                    .promise();
                body = `Put item ${requestJSON.id}`;
                break;
            default:
                throw new Error(`Unsupported route: "${event.routeKey}"`);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers
    };
};
