/*
 * Natural Language Processing Library for JavaScript
 *
 * A client-side NLP utility library for web applications
 *
 * Copyright 2015 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Authors:
 *   Elliot Smith <elliot.smith@intel.com>
 *   Max Waterman <max.waterman@intel.com>
 *   Plamena Manolova <plamena.manolova@intel.com>
 */


/*
this is a test script to figure out whether results returned by
Google Image Search have any EXIF data in the result itself
*/
var https = require('https');
var http = require('http');

var ExifImage = require('exif').ExifImage;

var url = "https://www.googleapis.com/customsearch/v1?searchType=image&key=AIzaSyARyiQ40rIjCtqtamRW98McMrU1gFgDPDE&cx=010167764530769062315:196d4y__4ss&safe=high&num=10&start=1&q=oscar+ceremony+photo";

// cb(error, results)
var sendRequest = function (url, cb) {
  var client = https;
  if (/^http:/.test(url)) {
    client = http;
  }

  var req = client.request(url, function (resp) {
    var body = new Buffer(0);

    resp.on('data', function (chunk) {
      body = Buffer.concat([body, chunk]);
    });

    resp.on('end', function () {
      cb(null, body);
    });
  });

  req.on('error', function (err) {
    cb(err);
  });

  req.end();
};

sendRequest(url, function (err, responseBuf) {
  var results = JSON.parse(responseBuf.toString());

  // NB there is *no* EXIF data in the results themselves
  for (var i = 0; i < results.items.length; i++) {
    console.log('\nRESULT ' + i);
    console.log(JSON.stringify(results.items[i], null, 2));
  }

  // but we can get EXIF data from the image the result points at
  var firstImageLink = results.items[0].link;
  var suffix = firstImageLink.match(/(\.[^\/]+?)$/)[1].toLowerCase();
  var filename = './out' + suffix;

  console.log('\nfetching image data from URL ' + firstImageLink);

  sendRequest(firstImageLink, function (err, imageDataBuf) {
    // node-exif can read directly from buffers
    new ExifImage({image: imageDataBuf}, function (err, exifData) {
      console.log('\nEXIF DATA');
      console.log(JSON.stringify(exifData, null, 2));
    });
  });
});
