/*********************************************************************************************************************
 *  Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

 'use strict';

 let AWS = require('aws-sdk');
 let s3 = new AWS.S3();
 const fs = require('fs');
 //var _downloadKey = 'agentextensions/latest/web-site-manifest.json';
 var _downloadKey = '';
 const _downloadLocation = '/tmp/web-site-manifest.json';
 const AmazonCognitoIdentity = require('./amazon-cognito-identity.min.js');
 /**
  * Helper function to interact with s3 hosted website for cfn custom resource.
  *
  * @class websiteHelper
  */
 let websiteHelper = (function() {
 
     /**
      * @class websiteHelper
      * @constructor
      */
     let websiteHelper = function() {};
 
     /**
      * Provisions the web site UI at deployment.
      * @param {string} sourceS3Bucket - Bucket containing the web site files to be copied.
      * @param {string} sourceS3prefix - S3 prefix to prepend to the web site manifest file names to be copied.
      * @param {string} destS3Bucket - S3 destination bucket to copy website content into
      * @param {string} destS3KeyPrefix - S3 file prefix (website folder) for the website content
      * @param {string} userPoolId - Cognito User Pool Id for web site configuration
      * @param {string} userPoolClientId - Cognito User Pool Client Id for web site configuration
      * @param {string} identityPoolId - Cognito Identity Pool ID
      * @param {string} region - Region of destination S3 bucket
      * @param {copyWebSiteAssets~requestCallback} cb - The callback that handles the response.
      */
     websiteHelper.prototype.copyWebSiteAssets = function(resourceProperties, cb) {
         var sourceS3Bucket = resourceProperties.sourceS3Bucket;
         var sourceS3prefix = resourceProperties.sourceS3key ;
         var destS3Bucket = resourceProperties.destS3Bucket;
         var destS3KeyPrefix = resourceProperties.destS3KeyPrefix;
         var region = resourceProperties.Region;
         var identityPoolId = resourceProperties.identityPoolId;
         var userPoolID = resourceProperties.userPoolID;
         var appClientId = resourceProperties.appClientId;
         var agentExtensionsTable = resourceProperties.agentExtensionsTable;
         _downloadKey = resourceProperties.manifestLocation
         //'agentextensions/latest/web-site-manifest.json';
         console.log("Copying UI web site");
         console.log(['source bucket:', sourceS3Bucket].join(' '));
         console.log(['source prefix:', sourceS3prefix].join(' '));
         console.log(['destination bucket:', destS3Bucket].join(' '));
         console.log(['destination s3 key prefix:', destS3KeyPrefix].join(' '));
         console.log(['region:', region].join(' '));
         console.log(['identityPoolId:', identityPoolId].join(' '));
         console.log(['userPoolID:', userPoolID].join(' '));
         console.log(['appClientId:', appClientId].join(' '));
         console.log(['agentExtensionsTable:', agentExtensionsTable].join(' '));
 
         
         downloadWebisteManifest(sourceS3Bucket, _downloadKey, _downloadLocation, function(err, data) {
             if (err) {
                 console.log(err);
                 return cb(err, null);
             }
 
             fs.readFile(_downloadLocation, 'utf8', function(err, data) {
                 if (err) {
                     console.log(err);
                     return cb(err, null);
                 }
 
                 console.log(data);
                 let _manifest = validateJSON(data);
 
                 if (!_manifest) {
                     return cb('Unable to validate downloaded manifest file JSON', null);
                 } else {
                     uploadFile(_manifest.files, 0, destS3Bucket, destS3KeyPrefix, [sourceS3Bucket, sourceS3prefix]
                         .join('/'),
                         function(err, result) {
                             if (err) {
                                 return cb(err, null);
                             }
                             console.log(result);
                             createAWSCredentials(destS3Bucket, destS3KeyPrefix, region, identityPoolId, userPoolID, appClientId, agentExtensionsTable,
                                 function(err, createResult) {
                                     if (err) {
                                         return cb(err, null);
                                     }else{
                                         registerDemoUser(userPoolID, appClientId, region,                                
                                             function(err, createResult) {
                                                 if (err) {
                                                     return cb(err, null);
                                                 }
                                                 else{
                                                     updateUsersAttributes(userPoolID, region, 
                                                     function(err, updateResult){
                                                         if (err) {
                                                             return cb(err, null);
                                                         }else{
                                                             return cb(null, updateResult);
                                                         }
                                                         
                                                     });
                                                 }
                                             });
                                     }
                                     //return cb(null, result);
                                 });
                         });
                 }
 
             });
 
         });
 
     };
     
  let createAWSCredentials = function(destS3Bucket, destS3KeyPrefix, region, identityPoolId, userPoolID, appClientId, agentExtensionsTable, cb) {
         let str = "";
         str+= "   function getRegion(){ \n";
         str+= "      return '" + region + "';\n";
         str+= "   } \n\n";
         str+= "   function getCognitoIdentityPoolId(){ \n";
         str+= "      return '" + identityPoolId + "';\n";
         str+= "   } \n\n";
         str+= "   function getCognitoUserPoolId(){ \n";
         str+= "      return '" + userPoolID + "';\n";
         str+= "   } \n\n";
         str+= "   function getCognitoClientId(){ \n";
         str+= "      return '" + appClientId + "';\n";
         str+= "   } \n\n";		
         str+= "   function getAgentExtensionsTable(){ \n";
         str+= "      return '" + agentExtensionsTable + "';\n";
         str+= "   } \n\n";		
 
 
         
         console.log(str);
         let params = {
             Bucket: destS3Bucket,
             Key: destS3KeyPrefix + '/js/aws-cognito-config.js',
             ACL: 'public-read',
             Body: str
         };
 
         s3.putObject(params, function(err, data) {
             if (err) {
                 console.log(err);
                 return cb('error creating js/aws-cognito-config.js file for website UI', null);
             }
             console.log(data);
             return cb(null, data);
             
         });
     };    
 
     /**
      * Helper function to validate the JSON structure of contents of an import manifest file.
      * @param {string} body -  JSON object stringify-ed.
      * @returns {JSON} - The JSON parsed string or null if string parsing failed
      */
     let validateJSON = function(body) {
         try {
             let data = JSON.parse(body);
             console.log(data);
             return data;
         } catch (e) {
             // failed to parse
             console.log('Manifest file contains invalid JSON.');
             return null;
         }
     };
 
     let registerDemoUser = function(userPoolID, appClientId, region, cb){
             var poolData = { 
                 UserPoolId : userPoolID,
                 ClientId : appClientId
             };
             console.log('UserPool Info');
             console.log(JSON.stringify(poolData));
             var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
         
             var attributeList = [];
             
             var dataEmail = {
                 Name : 'email',
                 Value : 'sjobs@sjobs.com'
             };
             var dataEmailVerified = {
                 Name : 'email_verified',
                 Value : 'true'
             };
             
             var dataPhoneNumber = {
                 Name : 'phone_number',
                 Value : '+15555555555'
             };
             var dataPhoneNumberVerified = {
                 Name : 'phone_number_verified',
                 Value : 'true'
             };
             
             var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
             var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);
         
             var attributeEmailVerified = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmailVerified);
             var attributePhoneNumberVerified = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumberVerified);
         
             attributeList.push(attributeEmail);
             attributeList.push(attributePhoneNumber);
         
             console.log(JSON.stringify(attributeList));
             userPool.signUp('sjobs', 'password', attributeList, null, function(err, result){
                 if (err) {
                     console.log(err);
                     return cb(err, null);
                 }
                 var cognitoUser = result.user;
                 console.log('user name is ' + cognitoUser.getUsername() + ' is successfully registered');
                 return cb(null, 'user name is ' + cognitoUser.getUsername() + ' is successfully registered');
                 //updateUsersAttributes(userPoolID,region);
             }); 
     }
 
     let updateUsersAttributes = function(userPoolID, region, cb){
         var CognitoIdentityServiceProvider = AWS.CognitoIdentityServiceProvider
     
         var client = new CognitoIdentityServiceProvider({
           apiVersion: '2016-04-19',
           region: region
         })
     
         client.adminUpdateUserAttributes({
           UserAttributes: [{
               Name: 'phone_number_verified',
               Value: 'true'
             }, {
               Name: 'email_verified',
               Value: 'true'
             }
             // other user attributes like phone_number or email themselves, etc
           ],
           UserPoolId: userPoolID,
           Username: 'sjobs'
         }, function(err) {
           if (err) {
             console.log('Error setting verified flag for sjobs');  
             console.log(err, err.stack);
             return cb(err, null);
           } else {
             console.log('Successful in verifing phone and email!')
             var params = {
               UserPoolId: userPoolID,
               Username: 'sjobs' /* required */
             };
             client.adminConfirmSignUp(params, function(err, data) {
               if (err){
                 console.log('Error setting confirming for sjobs');    
                 console.log(err, err.stack); // an error occurred  
                 return cb(err, null);
               } 
               else{
                 console.log(data);
                 return cb(null, 'Successful enabled the user');
               }   
             });
             
           }
         });
         
         
     }
     let uploadFile = function(filelist, index, destS3Bucket, destS3KeyPrefix, sourceS3prefix, cb) {
         if (filelist.length > index) {
             let params = {
                 Bucket: destS3Bucket,
                 Key: destS3KeyPrefix + '/' + filelist[index],
                 ACL: 'public-read',
                 CopySource: [sourceS3prefix, filelist[index]].join('/')
             };
             if (filelist[index].endsWith('.htm') || filelist[index].endsWith('.html')) {
                 params.ContentType = "text/html";
                 params.MetadataDirective = "REPLACE";
             } else if (filelist[index].endsWith('.css')) {
                 params.ContentType = "text/css";
                 params.MetadataDirective = "REPLACE";
             } else if (filelist[index].endsWith('.js')) {
                 params.ContentType = "application/javascript";
                 params.MetadataDirective = "REPLACE";
             } else if (filelist[index].endsWith('.png')) {
                 params.ContentType = "image/png";
                 params.MetadataDirective = "REPLACE";
             } else if (filelist[index].endsWith('.jpg') || filelist[index].endsWith('.jpeg')) {
                 params.ContentType = "image/jpeg";
                 params.MetadataDirective = "REPLACE";
               } else if (filelist[index].endsWith('.pdf')) {
                   params.ContentType = "application/pdf";
                   params.MetadataDirective = "REPLACE";
             } else if (filelist[index].endsWith('.gif')) {
                 params.ContentType = "image/gif";
                 params.MetadataDirective = "REPLACE";
             };
 
             s3.copyObject(params, function(err, data) {
                 if (err) {
                     return cb(['error copying ', [sourceS3prefix, filelist[index]].join('/'), '\n', err]
                         .join(
                             ''),
                         null);
                 }
 
                 console.log([
                     [sourceS3prefix, filelist[index]].join('/'), 'uploaded successfully'
                 ].join(' '));
                 let _next = index + 1;
                 uploadFile(filelist, _next, destS3Bucket, destS3KeyPrefix, sourceS3prefix, function(err, resp) {
                     if (err) {
                         return cb(err, null);
                     }
 
                     cb(null, resp);
                 });
             });
         } else {
             cb(null, [index, 'files copied'].join(' '));
         }
 
     };
 
     /**
      * Helper function to download the website manifest to local storage for processing.
      * @param {string} s3_bucket -  Amazon S3 bucket of the website manifest to download.
      * @param {string} s3_key - Amazon S3 key of the website manifest to download.
      * @param {string} downloadLocation - Local storage location to download the Amazon S3 object.
      * @param {downloadManifest~requestCallback} cb - The callback that handles the response.
      */
     let downloadWebisteManifest = function(s3Bucket, s3Key, downloadLocation, cb) {
         let params = {
             Bucket: s3Bucket,
             Key: s3Key
         };
 
         console.log(params);
 
         // check to see if the manifest file exists
         s3.headObject(params, function(err, metadata) {
             if (err) {
                 console.log(err);
             }
 
             if (err && err.code === 'NotFound') {
                 // Handle no object on cloud here
                 console.log('file doesnt exist');
                 return cb('Manifest file was not found.', null);
             } else {
                 console.log('file exists');
                 console.log(metadata);
                 let file = require('fs').createWriteStream(downloadLocation);
 
                 s3.getObject(params).
                 on('httpData', function(chunk) {
                     file.write(chunk);
                 }).
                 on('httpDone', function() {
                     file.end();
                     console.log('website manifest downloaded for processing...');
                     return cb(null, 'success');
                 }).
                 send();
             }
         });
     };
 
     return websiteHelper;
 
 })();
 
 module.exports = websiteHelper;