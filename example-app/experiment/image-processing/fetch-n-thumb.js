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


// fetch an image from the web and thumbnail it as a png;
// runs as a server on port 9999;
// requires GraphicsMagick to be installed on the server
//
// example request:
//
// http://localhost:9999/?url=https://upload.wikimedia.org/wikipedia/commons/e/e1/Battle_of_Hastings_Battleground.JPG&width=200&height=200
//
// the width and height of the thumbnail are available in the
// X-Thumbnail-Width and X-Thumbnail-Height response headers

var https = require('https');
var http = require('http');
var fs = require('fs');

var restify = require('restify');
var gm = require('gm');

// default max width or height of resulting thumbnail
var THUMBNAIL_SIDE = 600;

// returns a promise which resolves to a buffer containing response data
// from the URL <url>
var getAsBuffer = function (url) {
  return new Promise(function (resolve, reject) {
    var chunks = [];

    // get the right client function depending on whether the URL is
    // https or not
    var fn = (/^https/.test(url) ? https.request : http.request);

    var req = fn(url, function (res) {
      res.on('data', function (d) {
        chunks.push(d);
      });

      res.on('end', function () {
        var buf = Buffer.concat(chunks);
        resolve(buf);
      });
    });

    req.on('response', function (res) {
      if (res.statusCode !== 200) {
        var err = new Error('got bad status code (not 200): ' +
                            res.statusCode + '\nHEADERS: ' +
                            JSON.stringify(res.headers));

        reject(err);
      }
    });

    req.on('error', function (err) {
      reject(err);
    });

    req.end();
  });
};

// given <originalSize> in form {width: w, height:h}, find the scale needed
// to make it fit inside the bounding box <bounds> in form
// {width: maxW, height: maxH}, then return the new size as
// {width: newW, height: newH}
var getSize = function (originalSize, bounds) {
  var scaleW = bounds.width / originalSize.width;
  var scaleH = bounds.height / originalSize.height;

  var scaleBoth = scaleW;
  if (scaleH < scaleW) {
    scaleBoth = scaleH;
  }

  return {
    width: originalSize.width * scaleBoth,
    height: originalSize.height * scaleBoth
  };
};

// retrieve image at URL, shrink it, then return it as a promise
// which resolve to an object with stream and size:
// {stream: <readable png stream>, size: {width: w, height: h}}
// or rejects on any error
var getShrunkenImage = function (url, maxWidth, maxHeight) {
  return new Promise(function (resolve, reject) {
    getAsBuffer(url)
    .then(
      function (buf) {
        var img = gm(buf);

        img.size(function (err, size) {
          if (err) {
            reject(err);
          } else {
            var bounds = {width: maxWidth, height: maxHeight};
            var newSize = getSize(size, bounds);

            img.resize(newSize.width, newSize.height);

            resolve({
              stream: img.stream('png'),
              size: newSize
            });
          }
        });
      },

      reject
    );
  });
};

// run thumbnail server
var server = restify.createServer({
  name: 'thumbnailer'
});

server.use(restify.queryParser());

server.get('/', function (req, res, next) {
  var url = req.query.url;

  var onError = function (err) {
    console.error(err.stack);
    return next(err);
  };

  if (!url) {
    var err = new Error('no image URL specified in querystring');
    onError(err);
  } else {
    var width = req.params.width || THUMBNAIL_SIDE;
    var height = req.params.height || THUMBNAIL_SIDE;

    return getShrunkenImage(url, width, height)
    .then(
      function (result) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('X-Thumbnail-Width', result.size.width);
        res.setHeader('X-Thumbnail-Height', result.size.height);
        res.writeHead(200);
        result.stream.pipe(res);
        next();
      },

      onError
    )
    .catch(onError);
  }
});

server.listen(9999);
