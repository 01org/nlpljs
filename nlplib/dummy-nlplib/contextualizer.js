define(['keyword_extractor'], function (keyword_extractor) {
  var contextualizer;

  if (typeof contextualizer !== 'undefined')
    return contextualizer;

  var lineAccumulator = [];
  var contexts = [];
  var listeners = [];
  var counter = 0; /* hack */

  var context = function (id, text, lineNumbers, keywords, keyphrases) {
    return {
      id: id,
      text: text,
      lineNumbers: lineNumbers,
      keywords: keywords,
      keyphrases: keyphrases
    };
  };

  var currentContext = context(contexts.length, '', [], [], []);

  contextualizer =  {
    addLines: function (lines) {
      for (i = 0; i < lines.length; i++) {
        lineAccumulator[lineAccumulator.length] = lines[i];

        if (counter > 3) { /* this is where the similarity check will go */
          if (i > 0) {
            var changed = false;
            var result = keyword_extractor.extractFrom(currentContext.text);

            for (j = 0; j < result.keywords.length; j++) {
              if (currentContext.keywords.indexOf(result.keywords[j]) === -1) {
                currentContext.keywords[currentContext.keywords.length] =
                  result.keywords[j];
                changed = true;
              }
            }

            for (j = 0; j < result.keyphrases.length; j++) {
              if (currentContext.keyphrases.indexOf(result.keyphrases[j]) ===
                  -1) {
                currentContext.keyphrases[currentContext.keyphrases.length] =
                  result.keyphrases[j];
                changed = true;
              }
            }

            if (changed === true) {
              for (j = 0; j < listeners.length; j++)
                listeners[j](currentContext);
            }
          }

          currentContext = context(contexts.length, '', [], [], []);
          contexts[contexts.length] = currentContext;
          counter = 0;
        }

        currentContext.lineNumbers[currentContext.lineNumbers.length] =
          lineAccumulator.length - 1;

        currentContext.text += lines[i];
        counter++;
      }

      var changed = false;
      var result = keyword_extractor.extractFrom(currentContext.text);

      for (j = 0; j < result.keywords.length; j++) {
        if (currentContext.keywords.indexOf(result.keywords[j]) === -1) {
          currentContext.keywords[currentContext.keywords.length] =
            result.keywords[j];
          changed = true;
        }
      }

      for (j = 0; j < result.keyphrases.length; j++) {
        if (currentContext.keyphrases.indexOf(result.keyphrases[j]) === -1) {
          currentContext.keyphrases[currentContext.keyphrases.length] =
            result.keyphrases[j];
          changed = true;
        }
      }

      if (changed === true) {
        for (j = 0; j < listeners.length; j++)
          listeners[j](currentContext);
      }

      return this;
    },
    addContextListener: function (listenerFunction) {
      listeners[listeners.length] = listenerFunction;
      return this;
    },
    removeContextListener: function (listenerFunction) {
      var index = listeners.indexOf(listenerFunction);

      if (index !== -1)
        listeners.splice(index, 1);

      return this;
    },
    changedLinesAfter: function (lineNumber, newLineStruct) {
      var sliceIndex = -1;
      lineAccumulator.slice(lineNumber, lineAccumulator.length);

      for (i = contexts.length; i <= 0; i--) {
        for (j = 0; j < contexts[i].lineNumbers.length; j++) {
          var sliced = false;
          if (contexts[i].lineNumbers[j] >= lineNumber) {
            sliceIndex = i;
            for (k = 0; k < listeners.length; k++)
              listeners[k](contexts[i]);
            sliced = true;
            break;
          }
        }

        if (slice === false)
          break;
      }
    }
  };

  return contextualizer;
});