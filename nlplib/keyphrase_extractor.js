function
TextGraphVertex (id,
                 content,
                 props)
{
  this.id = id;
  this.content = content;
  this.score = 1;
  this.props = props;
  this.connections = [];
}

function
TextGraphEdge (a,
               b,
               distance)
{
  this.a = a;
  this.b = b;
  this.distance = distance;
}

function 
tagText (text)
{
  var taggedText = [];
  var Retext = require('retext'),
    visit = require('retext-visit'),
    pos = require('retext-pos');
  var posTagger = new Retext()
    .use(visit)
    .use(pos)
    .parse(text);

  posTagger.visitType(posTagger.WORD_NODE, function (node)
  {
    taggedText[taggedText.length] = { token: node.toString(),
      posTag: node.data.partOfSpeech };
  });

  return taggedText;
}

function
filterVertices(vertex)
{
  if (vertex.props[0] != 'N' && vertex.props[0] != 'J')
  {
    if (vertex.content == 'of')
      console.log("NOW!");
    for (j = 0; j < vertex.connections.length; j++)
    {
      if (vertex.content == 'of')
        console.log(vertex.connections[j].content);
      var ind = vertex.connections[j].connections.indexOf(vertex);
      vertex.connections[j].connections.splice(ind, 1);
    }
    return false;
  }
  else
    return true;
}

function
filterEdges(edge)
{
  return ((edge.a.props[0] == 'N' || edge.a.props[0] == 'J') &&
          (edge.b.props[0] == 'N' || edge.b.props[0] == 'J'))
}

function
TextGraph (text)
{
  this.text = text;
  this.vertices = [];
  this.edges = [];
  this.vertexKeys = [];
  this.edgeKeys = [];

  /* Annotate the text with part of speech tags */
  var taggedText = tagText(text);
  var adjLimit = 2;

  /* Construct the text graph */
  for (i = 0; i < taggedText.length; i++)
  {
    var vertex = this.vertexKeys[taggedText[i].token.toLowerCase()];

    if (!vertex)
    {
      vertex = new TextGraphVertex(i, taggedText[i].token.toLowerCase(),
                                   taggedText[i].posTag);

      if (vertex.props[0] == 'N' || vertex.props[0] == 'J')
        this.vertices[this.vertices.length] = vertex;

      this.vertexKeys[vertex.content] = vertex;
    }

    for (j = adjLimit; j > 0; j--)
    {
      if (taggedText[i - j])
      {
        var prev = this.vertexKeys[taggedText[i - j].token.toLowerCase()];
        var edge = this.edgeKeys[prev.content + " " + vertex.content];

        if (!edge && ((prev.props[0] == 'N' || prev.props[0] == 'J') && 
                      (vertex.props[0] == 'N' || vertex.props[0] == 'J')) &&
            prev != vertex)
        {
          edge = new TextGraphEdge(prev, vertex, j);
          this.edges[this.edges.length] = edge;
          this.edgeKeys[prev.content + " " + vertex.content] = edge;
        }

        if (vertex.connections.indexOf(prev) == -1 &&
            (prev.props[0] == 'N' || prev.props[0] == 'J') &&
            vertex != prev)
          vertex.connections[vertex.connections.length] = prev;
        if (prev.connections.indexOf(vertex) == -1 &&
            (vertex.props[0] == 'N' || vertex.props[0] == 'J') &&
            prev != vertex)
          prev.connections[prev.connections.length] = vertex;
      }
    }
  }

  //this.vertices = this.vertices.filter(filterVertices);
  //this.edges = this.edges.filter(filterEdges);
}

function
scoreVertex (vertex)
{
  var dampingFactor = 0.85;
  var total = 0;

  for (key in vertex.connections)
  {
    if (vertex.connections[key].connections.length > 0)
    {
      total += vertex.connections[key].score /
        vertex.connections[key].connections.length;
    }
  }

  vertex.score = (1 - dampingFactor) + dampingFactor * total;
}

function
KeyphraseExtractor (text)
{
  var numIters = 30;
  var graph = new TextGraph(text);
  var numTopWords = graph.vertices.length / 3.0;
  var topWords;
  var keyphrases = [];

  if (numTopWords % 1 > 0)
    numTopWords = Math.floor(numTopWords) + 1;

  for (i = 0; i < numIters; i++)
  {
    for (j in graph.vertices)
      scoreVertex(graph.vertices[j]);
  }

  graph.vertices.sort(function (a, b) { return b.score - a.score; });
  topWords = graph.vertices.slice(0, numTopWords);

  //for (i = 0; i < graph.vertices.length; i++)
    //console.log(graph.vertices[i].content, graph.vertices[i].connections);

  for (i = 0; i < numTopWords; i++)
  {
    for (j = 0; j < numTopWords; j++)
    {
      var edge = graph.edgeKeys[topWords[i].content + " "
        + topWords[j].content];

      if (edge && edge.distance == 1)
      {
        if (text.indexOf(topWords[i].content + " " + topWords[j].content) != -1)
        {
          keyphrases[keyphrases.length] = { 
            phrase: topWords[i].content + " " + topWords[j].content,
            score: topWords[i].score + topWords[j].score };
        }
      }
    }
  }

  console.log(topWords);
  console.log(keyphrases);

  return { keywords: topWords, keyphrases: keyphrases };
}



exports.KeyphraseExtractor = KeyphraseExtractor;