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

(function () {
  var makeTokenizer = function () {
    var specialCharacters = ['!', '"', '£', '$', '%', '^', '&', '*', '(', ')',
         '+', '=', '{', '[', '}', '}', ':', ';', '@', '~', '#', '<', ',',
         '>', '?', '/', '|', '\\', '`', '“', '”'];

    var digitRegex = /\d/;
    var notDigitRegex = /[^\d]/;
    var alphaRegex = /[A-Za-z]/;
    var notAlphaRegex = /[^A-Za-z]/;
    var capitalRegex = /[A-Z]/;

    var tokenizer = {
      tokenize: function (text) {
        var lastCharPosition = text.length - 1;
        var tokens = [];
        var token = '';
        var i = 0;
        var char;

        while (i < text.length) {
          char = text[i];

          if (specialCharacters.indexOf(char) !== -1) {
            if (token !== '') {
              tokens.push(token);
            }

            tokens.push(char);
            token = '';
          }
          else if (char === " ") {
            if (token !== '') {
              tokens.push(token);
            }
            token = '';
          }
          else if (char === ".") {
            if (digitRegex.test(token[0]) && !alphaRegex.test(token)) {
              if (!notDigitRegex.test(token) && notDigitRegex.test(text[i + 1])) {
                tokens.push(token);
                token = '';
              } else if (token.indexOf('.') !== -1) {
                tokens.push(token);
                token = '';
              }
            } else {
              if (capitalRegex.test(token[0])) {
                if (!notAlphaRegex.test(token) && (/[aeyuo]/.test(token.slice(1)) ||
                    token.length > 3)) {
                  tokens.push(token);
                  token = '';
                }
              } else if (token.length > 1 && token[token.length - 2] !== ".") {
                tokens.push(token);
                token = '';
              }
            }

            if (token === '') {
              tokens.push(char);
            } else {
              token += char;
            }
          }
          else if (char === "'") {
            if (token !== '') {
              if (notDigitRegex.test(token)) {
                tokens.push(token);
                token = char;
              } else {
                token += char;
              }
            } else {
              tokens.push(char);
            }
          } else {
            token += char;
          }

          if (i === lastCharPosition && token !== '') {
            tokens.push(token);
          }

          i++;
        }

        return tokens;
      }
    };

    return tokenizer;
  };

  if (typeof define !== 'undefined' && define.amd) {
    define(function () {
      return makeTokenizer();
    });
  } else {
    module.exports = makeTokenizer();
  }
})();
