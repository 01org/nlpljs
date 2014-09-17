define(['tokenizer'], function() {
  var tokenizer;

  if (typeof tokenizer !== 'undefined')
    return tokenizer;

  var specialCharacters = ['!', '"', '£', '$', '%', '^', '&', '*', '(', ')',
       '+', '=', '{', '[', '}', '}', ':', ';', '@', '~', '#', '<', ',',
       '>', '?', '/', '|', '\\', '`'];

  tokenizer =  {
    tokenize: function (text) {
      var tokens = [];
      var token = '';
      var i = 0;

      while (i < text.length) {
        if (/[^A-Za-z0-9]/.test(text[i]) && text[i] !== "." &&
            text[i] !== "'" && text[i] !== " " && text[i] !== "-") {
          if (token.length > 0)
            tokens[tokens.length] = token;

          tokens[tokens.length] = text[i];
          token = '';
        }
        else if (text[i] === " ") {
          if (token.length > 0)
            tokens[tokens.length] = token;
          token = '';
        }
        else if (text[i] === ".") {
          if (token.length === 0)
            tokens[tokens.length] = text[i];
          else if (/[0-9]/.test(token[0]) && !/[A-Za-z]/.test(token)) {
            if (!/[^0-9]/.test(token) && /[^0-9]/.test(text[i + 1])) {
              tokens[tokens.length] = token;
              token = '';
            }
            else if (token.indexOf('.') !== -1) {
              tokens[tokens.length] = token;
              token = '';
            }
          }
          else {
            if (/[A-Z]/.test(token[0])) {
              if (!/[^A-Za-z]/.test(token) && (/[aeyuo]/.test(token.slice(1)) ||
                  token.length > 3)) {
                tokens[tokens.length] = token;
                token = '';
              }
            }
            else if (token.length > 1 && token[token.length - 2] !== ".") {
              tokens[tokens.length] = token;
              token = '';
            }
          }

          if (token === '')
            tokens[tokens.length] = text[i];
          else
            token += text[i];
        }
        else if (text[i] === "'") {
          if (token.length > 0 && text[i + 1] != " ") {
            if (/[^0-9]/.test(token)) {
              tokens[tokens.length] = token;
              token = text[i];
            }
            else
              token += text[i];
          }
          else {
            tokens[tokens.length] = token;
            tokens[tokens.length] = text[i];
          }
        }
        else
          token += text[i];

        if (i === text.length - 1 && token.length > 0)
          tokens[tokens.length] = token;

        i++;
      }
      /*
      var extractToken = function (index) {
        var token = '';

        for (i = index; i < text.length; i++) {
          if (/[^A-Za-z0-9]/.test(text[i]) && text[i] != "." && text[i] != "'") {
            if (token.length > 0)
              tokens[tokens.length] = token;

            tokens[tokens.length] = text[i];
            index = i + 1;
            break;
          }
          else if (text[i] === ' ') {
            if (token.length > 0)
              tokens[tokens.length] = token;
            index = i + 1;
            break;
          }
          else {
            if ((text[i] === "'" && token.length > 0 && /[^0-9]/.test(token)) ||
                text[i + 1] === " ") {
              tokens[tokens.length] = token;
              break;
            }

            if (text[i] === ".") {
              if (token.length === 0) {
                tokens[tokens.length] = text[i];
                index = i + 1;
                break;
              }
              else if (/[0-9]/.test(token[0])) {
                if (!/[^0-9]/.test(token) && /[^0-9]/.test(text[i + 1])) {
                  tokens[tokens.length] = token;
                  tokens[tokens.length] = text[i];
                  index = i + 1;
                  break;
                }
                else if (token.indexOf('.') !== -1) {
                  tokens[tokens.length] = token;
                  tokens[tokens.length] = text[i];
                  index = i + 1;
                  break;
                }
              }
              else {
                if (/[A-Z]/.test(token[0])) {
                  if (!/[^A-Za-z]/.test(token) &&
                     (/[aeyuo]/.test(token.slice(1)) || token.length > 3)) {
                    tokens[tokens.length] = token;
                    tokens[tokens.length] = text[i];
                    index = i + 1;
                    break;
                  }
                }
                else if (token.length > 1 && token[token.length - 2] !== ".") {
                  tokens[tokens.length] = token;
                  tokens[tokens.length] = text[i];
                  index = i + 1;
                  break;
                }
              }
            }

            token += text[i];
            index = i + 1;

            if (token[0] === "'" && token.length > 3) {
              tokens[tokens.length] = token[0];
              token = token.slice(1);
            }

            if (i === text.length - 1) {
              tokens[tokens.length] = token;
              break;
            }
          }
        }

        if (index !== text.length)
          extractToken(index);
      };

      extractToken(0);*/
      console.log("Tokenization complete");
      return tokens;
    }
  };

  return tokenizer;
});