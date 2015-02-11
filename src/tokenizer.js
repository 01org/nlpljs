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
