define(['tokenizer'], function() {
  var tokenizer;

  if (typeof tokenizer !== 'undefined')
    return tokenizer;

  var specialCharacters = ['!', '"', '£', '$', '%', '^', '&', '*', '(', ')',
       '+', '=', '{', '[', '}', '}', ':', ';', '@', '~', '#', '<', ',',
       '>', '.', '?', '/', '|', '\\', '`'];

  var onSpace = function (tokens, currentToken, charIndex) {
    if (currentToken.length > 0)
      tokens[currentToken.length] = token;

    return charIndex + 1;
  };

  tokenizer =  {
    tokenize: function (text) {
      var tokens = [];

      var extractToken = function (index) {
        var token = '';

        for (i = index; i < text.length; i++) {
          if (specialCharacters.indexOf(text[i]) !== -1) {
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
            if (text[i] === "'" && token.length > 0) {
              tokens[tokens.length] = token;
              break;
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

      extractToken(0);
      return tokens;
    }
  };

  return tokenizer;
});