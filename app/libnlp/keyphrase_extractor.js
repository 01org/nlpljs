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

  var graphEdge = function (vertex1, vertex2, v1ID, v2ID) {
    return {
      a: vertex1,
      b: vertex2,
      aID: v1ID,
      bID: v2ID
    };
  };

  var textGraph = function () {
    var annotatedTokens = [];
    var sortedVertices = [];

    var vertexFilter = function (annotatedToken, id) {
      if (annotatedToken.tag[0] !== 'N' &&
          annotatedToken.tag[0] !== 'J') {
        /*if (annotatedToken.tag === 'IN' || annotatedToken.tag === 'CC') {
          if (typeof annotatedTokens[id - 1] !== 'undefined' &&
              typeof annotatedTokens[id + 1] !== 'undefined') {
            if (/[A-Z]/.test(annotatedTokens[id - 1].token[0]) &&
                /[A-Z]/.test(annotatedTokens[id + 1].token[0]))
              return true;
          }
        }*/

        return false;
      }

      return true;
    };

    return {
      vertices: {},
      edges: [],
      numVertices: 0,
      numEdges: 0,
      addText: function (text) {
        var tagged = postagger.tag(text);
        var prevLength = annotatedTokens.length;
        var adjLimit = 3;

        annotatedTokens = annotatedTokens.concat(tagged);

        for (i = prevLength; i < annotatedTokens.length; i++) {
          var vertex = this.vertices[annotatedTokens[i].token.toLowerCase()];

          if (vertexFilter(annotatedTokens[i], i) === true) {
            if (typeof vertex === 'undefined') {
              vertex = graphVertex(annotatedTokens[i].token.toLowerCase());
              this.vertices[annotatedTokens[i].token.toLowerCase()] =
                vertex;
              sortedVertices[sortedVertices.length] = vertex;
              this.numVertices++;
            }
          }
          else
            continue;

          if (i > 0) {
            for (j = 1; j < i + 1; j++) {
              if (j > adjLimit)
                break;

              var prevToken = annotatedTokens[i - j].token.toLowerCase();

              if (vertexFilter(annotatedTokens[i - j], i - j) === false)
                continue;

              var prevVertex = this.vertices[prevToken];

              vertex.addConnection(prevVertex);
              prevVertex.addConnection(vertex);

              if (j === 1) {
                var edge = graphEdge(prevVertex, vertex, i - j, i);
                this.edges[this.edges.length] = edge;

                this.numEdges++;
              }
            }
          }
        }

        return this;
      },
      sortVertices: function (topN) {
        sortedVertices.sort(function (a, b) { return b.score - a.score; });
        return sortedVertices.slice(0, topN);
      }
    };
  };

  var graph = null;

  keyword_extractor = {
    addText: function (text) {
      if (graph === null)
        graph = textGraph();

      graph.addText(text);

      return this;
    },
    getGraph: function () {
      return graph;
    },
    setGraph: function (newGraph) {
      graph = newGraph;

      return this;
    },
    score: function () {
      var converged = false;
      var keywords = [];
      var keyphrases = [];

      while (!converged) {
        converged = true;
        for (i in graph.vertices) {
          var oldScore = graph.vertices[i].score;

          graph.vertices[i].recalculateScore();

          if (graph.vertices[i].score < oldScore || 
              graph.vertices[i].score > oldScore)
            converged = false;
        }
      }

      var sorted = graph.sortVertices(Math.floor(graph.numVertices / 3));

      for (i = 0; i < sorted.length; i++)
        keywords[i] = sorted[i].content;

      var keyphrase;
      var prevEdge;

      for (i = 0; i < graph.edges.length; i++) {
        if (sorted.indexOf(graph.edges[i].a) !== -1 &&
            sorted.indexOf(graph.edges[i].b) !== -1) {
          if (typeof prevEdge === 'undefined' ||
              prevEdge.bID !== graph.edges[i].aID) {
            if (typeof keyphrase !== 'undefined' &&
                keyphrases.indexOf(keyphrase) === -1)
              keyphrases[keyphrases.length] = keyphrase;

            keyphrase = graph.edges[i].a.content;
            var index = keywords.indexOf(graph.edges[i].a.content);

            if (index !== -1)
              keywords.splice(index, 1);
          }

          keyphrase += " " + graph.edges[i].b.content;

          var index = keywords.indexOf(graph.edges[i].b.content);

          if (index !== -1)
            keywords.splice(index, 1);

          prevEdge = graph.edges[i];
        }
      }

      if (typeof keyphrase !== 'undefined' &&
          keyphrases.indexOf(keyphrase) === -1)
        keyphrases[keyphrases.length] = keyphrase;

      return {
        keywords: keywords,
        keyphrases: keyphrases
      };
    },
    reset: function () {
      graph = textGraph();

      return this;
    },
    extractFrom: function (text) {
      var graph = textGraph();
     /* var converged = false;
      var keywords = [];
      var keyphrases = [];*/

      graph.addText(text);

      /*while (!converged) {
        converged = true;
        for (i in graph.vertices) {
          var oldScore = graph.vertices[i].score;

          graph.vertices[i].recalculateScore();

          if (graph.vertices[i].score < oldScore || 
              graph.vertices[i].score > oldScore)
            converged = false;
        }
      }

      var sorted = graph.sortVertices(Math.floor(graph.numVertices / 3));

      for (i = 0; i < sorted.length; i++)
        keywords[i] = sorted[i].content;

      var keyphrase;
      var prevEdge;

      for (i = 0; i < graph.edges.length; i++) {
        if (sorted.indexOf(graph.edges[i].a) !== -1 &&
            sorted.indexOf(graph.edges[i].b) !== -1) {
          if (typeof prevEdge === 'undefined' ||
              prevEdge.bID !== graph.edges[i].aID) {
            if (typeof keyphrase !== 'undefined' &&
                keyphrases.indexOf(keyphrase) === -1)
              keyphrases[keyphrases.length] = keyphrase;

            keyphrase = graph.edges[i].a.content;
            var index = keywords.indexOf(graph.edges[i].a.content);

            if (index !== -1)
              keywords.splice(index, 1);
          }

          keyphrase += " " + graph.edges[i].b.content;

          var index = keywords.indexOf(graph.edges[i].b.content);

          if (index !== -1)
            keywords.splice(index, 1);

          prevEdge = graph.edges[i];
        }
      }

      if (typeof keyphrase !== 'undefined' &&
          keyphrases.indexOf(keyphrase) === -1)
        keyphrases[keyphrases.length] = keyphrase;*/

      var result = this.score();
      this.reset();
      return result;
    }
  };

  return keyword_extractor;
});