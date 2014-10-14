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
    var sortedVertices = [];

    var vertexFilter = function (annotatedToken, id) {
      if ((annotatedToken.tag[0] !== 'N' &&
           annotatedToken.tag[0] !== 'J') ||
          /[^a-zA-Z0-9]/.test(annotatedToken.token)) {
        if (annotatedToken.tag === 'IN') {
          if (typeof annotatedTokens[id - 1] !== 'undefined' &&
              typeof annotatedTokens[id + 1] !== 'undefined') {
            if (/[A-Z]/.test(annotatedTokens[id - 1].token[0]) &&
                /[A-Z]/.test(annotatedTokens[id + 1].token[0]))
              return true;
          }
        }

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
        var adjLimit = 2;

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
            var j = 1;
            var actualJ = 0;
            while (j <= adjLimit &&
                   typeof annotatedTokens[i - (actualJ + 1)] !== 'undefined') {
              actualJ++;
              var prevToken = annotatedTokens[i - j].token.toLowerCase();

              if (vertexFilter(annotatedTokens[i - j], i - j) === false)
                continue;

              var prevVertex = this.vertices[prevToken];

              if (typeof prevVertex === 'undefined')
                continue;

              vertex.addConnection(prevVertex);
              prevVertex.addConnection(vertex);

              if (actualJ === 1) {
                var edge = graphEdge(prevVertex, vertex, i - j, i,
                  annotatedTokens[i - j].tag, annotatedTokens[i].tag);
                this.edges[this.edges.length] = edge;

                this.numEdges++;
              }
              j++;
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

      var sorted = graph.sortVertices(Math.floor(graph.numVertices * (1 / 3)));

      for (i = 0; i < sorted.length; i++)
        keywords[i] = sorted[i].content;

      var keyphrase;
      var prevEdge = null;

      for (i = 0; i < graph.edges.length; i++) {
        if (prevEdge === null) {
          if ((sorted.indexOf(graph.edges[i].a) !== -1 ||
               sorted.indexOf(graph.edges[i].b) !== -1) ||
              (i < graph.edges.length - 1 &&
               sorted.indexOf(graph.edges[i + 1].b) !== -1)) {
            if (graph.edges[i].aTag !== 'IN') {
              keyphrase = graph.edges[i].a.content;
              var index = keywords.indexOf(graph.edges[i].a.content);

              if (index !== -1)
                keywords.splice(index, 1);
            }
            else
              keyphrase = '';
          }
          else
            continue;
        }

        if (keyphrase !== '')
          keyphrase += " ";

        keyphrase += graph.edges[i].b.content;

        var index = keywords.indexOf(graph.edges[i].b.content);

        if (index !== -1)
          keywords.splice(index, 1);

        prevEdge = graph.edges[i];

        if (typeof graph.edges[i + 1] !== 'undefined' && 
            graph.edges[i + 1].aID !== graph.edges[i].bID) {

          if (prevEdge.bTag === 'IN')
            keyphrase = keyphrase.slice(0, keyphrase.lastIndexOf(' '));

          if (keyphrases.indexOf(keyphrase) === -1)
            keyphrases[keyphrases.length] = keyphrase;

          prevEdge = null;
        }
      }

      if (typeof keyphrase !== 'undefined' && prevEdge !== null) {
        if (prevEdge.bTag === 'IN')
          keyphrase = keyphrase.slice(0, keyphrase.lastIndexOf(' '));

        if (keyphrases.indexOf(keyphrase) === -1)
          keyphrases[keyphrases.length] = keyphrase;
      }

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
      graph = textGraph();

      graph.addText(text);

      var result = this.score();
      this.reset();
      return result;
    }
  };

  return keyword_extractor;
});