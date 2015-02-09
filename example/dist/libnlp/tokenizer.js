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

        while (i < text.length) {
          if (specialCharacters.indexOf(text[i]) !== -1) {
            if (token !== '') {
              tokens.push(token);
            }

            tokens.push(text[i]);
            token = '';
          }
          else if (text[i] === " ") {
            if (token !== '') {
              tokens.push(token);
            }
            token = '';
          }
          else if (text[i] === ".") {
            if (token === '') {
              tokens.push(text[i]);
            } else if (digitRegex.test(token[0]) && !alphaRegex.test(token)) {
              if (!notDigitRegex.test(token) && notDigitRegex.test(text[i + 1])) {
                tokens.push(token);
                token = '';
              } else if (token.indexOf('.') !== -1) {
                tokens.push(token);
                token = '';
              }
            }
            else {
              if (capitalRegex.test(token[0])) {
                if (!notAlphaRegex.test(token) && (/[aeyuo]/.test(token.slice(1)) ||
                    token.length > 3)) {
                  tokens.push(token);
                  token = '';
                }
              }
              else if (token.length > 1 && token[token.length - 2] !== ".") {
                tokens.push(token);
                token = '';
              }
            }

            if (token === '') {
              tokens.push(text[i]);
            } else {
              token += text[i];
            }
          }
          else if (text[i] === "'") {
            if (token !== '') {
              if (notDigitRegex.test(token)) {
                tokens.push(token);
                token = text[i];
              } else {
                token += text[i];
              }
            } else {
              tokens.push(text[i]);
            }
          } else {
            token += text[i];
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
