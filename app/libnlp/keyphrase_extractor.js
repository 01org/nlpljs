define(['postagger'], function (postagger) {
  var keyword_extractor;

  if (typeof keyword_extractor !== 'undefined')
    return keyword_extractor;

  var graphVertex = function (content) {
    return {
      content: content,
      score: 1,
      connections: {},
      numConnections: 0,
      addConnection: function (vertex) {
        if (typeof this.connections[vertex.content] === 'undefined' &&
            vertex !== this) {
          this.connections[vertex.content] = vertex;
          this.numConnections++;
        }

        return this;
      },
      recalculateScore: function () {
        var dampingFactor = 0.85;
        var total = 0;

        for (key in this.connections) {
          if (this.connections[key].numConnections > 0) {
            total += this.connections[key].score /
              this.connections[key].numConnections;
          }
        }

        this.score = (1 - dampingFactor) + dampingFactor * total;

        return this;
      }
    };
  };

  var graphEdge = function (vertex1, vertex2, v1ID, v2ID, v1Tag, v2Tag) {
    return {
      a: vertex1,
      b: vertex2,
      aTag: v1Tag,
      bTag: v2Tag,
      aID: v1ID,
      bID: v2ID
    };
  };

  var textGraph = function () {
    var annotatedTokens = [];

    var vertexNames = [];
    var vertices = [];

    var edges = [];
    var edgeNames = [];

    var adjLimit = 2;
    var numKeywords = 1 / 3;

    var vertexFilter = function (annotatedToken, id) {
      if ((annotatedToken.tag[0] !== 'N' &&
           annotatedToken.tag[0] !== 'J') ||
          /[^a-zA-Z0-9]/.test(annotatedToken.token)) {
        if (annotatedToken.tag === 'IN' || annotatedToken.tag === 'CC') {
          if (typeof annotatedTokens[id - 1] !== 'undefined' &&
              typeof annotatedTokens[id + 1] !== 'undefined') {
            var prevToken = annotatedTokens[id - 1];
            var nextToken = annotatedTokens[id + 1];
            if ((/[A-Z]/.test(prevToken.token[0]) && vertexFilter(prevToken)) &&
                (/[A-Z]/.test(nextToken.token[0]) && vertexFilter(nextToken))) {
              return true;
            }
          }
        }

        return false;
      }

      return true;
    };

    var consturctGraph = function (from, to) {
      for (var i = from; i < to; i++) {
        var vertexIndex =
          vertexNames.indexOf(annotatedTokens[i].token.toLowerCase());
        var vertex;

        if (vertexFilter(annotatedTokens[i], i) === true) {
          if (vertexIndex === -1) {
            vertex = graphVertex(annotatedTokens[i].token.toLowerCase());
            vertices[vertices.length] = vertex;
            vertexNames[vertexNames.length] =
              annotatedTokens[i].token.toLowerCase();
          }
          else
            vertex = vertices[vertexIndex];
        }
        else
          continue;

        if (i > 0) {
          var j = 1;
          var actualJ = 0;
          while (j <= adjLimit &&
                 typeof annotatedTokens[i - (actualJ + 1)] !== 'undefined') {
            actualJ++;
            var prevToken = annotatedTokens[i - j].token.toLowerCase();

            if (vertexFilter(annotatedTokens[i - j], i - j) === false)
                continue;

            var prevVertexIndex = vertexNames.indexOf(prevToken);
            var prevVertex = vertices[prevVertexIndex];

            if (typeof prevVertex === 'undefined')
              continue;

            vertex.addConnection(prevVertex);
            prevVertex.addConnection(vertex);

            if (actualJ === 1) {
              var edge = graphEdge(prevVertex, vertex, i - j, i,
                annotatedTokens[i - j].tag, annotatedTokens[i].tag);

              edges[edges.length] = edge;
              edgeNames[edgeNames.length] = i - j + " " + i;
            }
            j++;
          }
        }
      }
    };

    var sortVertices = function (topN) {
      vertices.sort(function (a, b) { return b.score - a.score; });
      vertexNames = vertices.map(function (vertex) { return vertex.content; });
      return vertices.slice(0, topN);
    };

    var formKeyphrases = function () {
      var keywords = [];
      var scores = [];
      var sorted = sortVertices(Math.floor(vertices.length * (1 / 3)));
      var keyphrase = '';
      var prevEdge = null;
      var phraseScore = 0;
      var phraseLength = 0;

      for (var i = 0; i < sorted.length; i++) {
        keywords[i] = sorted[i].content;
        scores[i] = sorted[i].score;
      }

      for (var i = 0; i < edges.length; i++) {
        var containsKeyword;
        var nextContainsKeyword;

        if (sorted.indexOf(edges[i].a) !== -1 ||
            sorted.indexOf(edges[i].b) !== -1)
          containsKeyword = true;

        if (i < edges.length - 1) {
          if ((sorted.indexOf(edges[i + 1].a) !== -1 ||
               sorted.indexOf(edges[i + 1].b) !== -1) &&
              edges[i + 1].aID === edges[i].bID)
            nextContainsKeyword = true;
        }

        if (containsKeyword === false && nextContainsKeyword === false &&
            keyphrase === '')
          continue;

        if (keyphrase === '') {
          var index = keywords.indexOf(edges[i].a.content);
          keyphrase += edges[i].a.content;
          phraseScore += edges[i].a.score;
          phraseLength++;

          if (index !== -1) {
            keywords.splice(index, 1);
            scores.splice(index, 1);
          }
        }

        var index = keywords.indexOf(edges[i].b.content);

        keyphrase += ' ' + edges[i].b.content;
        phraseScore += edges[i].b.score;
        phraseLength++;

        if (index !== -1) {
          keywords.splice(index, 1);
          scores.splice(index, 1);
        }

        if (i === edges.length - 1 || (i < edges.length - 1 &&
            edges[i + 1].aID !== edges[i].bID)) {
          if (keywords.indexOf(keyphrase) === -1) {
            keywords[keywords.length] = keyphrase;
            scores[scores.length] = phraseScore / phraseLength;
          }

          keyphrase = '';
          phraseScore = 0;
          phraseLength = 0;
        }
      }

      console.log(keywords);
      console.log(scores);

      sorted = keywords.slice(0);

      sorted.sort(function (a, b) {
        var aScore = scores[keywords.indexOf(a)];
        var bScore = scores[keywords.indexOf(b)];
        return bScore - aScore;
      });

      scores.sort(function (a, b) { return  b - a });

      return {
        keywords: sorted,
        scores: scores
      };
    };

    var runTextRank = function () {
      var converged = false;

      while (!converged) {
        converged = true;
        for (var i = 0; i < vertices.length; i++) {
          var oldScore = vertices[i].score;

          vertices[i].recalculateScore();

          if (vertices[i].score < oldScore ||
              vertices[i].score > oldScore)
            converged = false;
        }
      }

      return formKeyphrases();
    };

    return {
      construct: function (text) {
        annotatedTokens = postagger.tag(text);
        consturctGraph(0, annotatedTokens.length);

        return this;
      },
      score: function () {
        return runTextRank();
      }
    };
  };

  var graph = null;

  keyword_extractor = {
    extractFrom: function (text) {
      graph = textGraph();
      graph.construct(text);

      return graph.score();
    }
  };

  return keyword_extractor;
});
