var text = "In Shenmue, Ryo Hazuki is the main protagonist, and the only \
playable character. Ryo is a young man of 18 years of age who has recently \
dropped out of Yokosuka High School to embark on a journey to avenge his \
father's murder. Four days after resting from his injury, Ryo begins training \
while gathering clues to Lan Di's whereabouts. Ryo stands at 5'9, with spikey \
hair, light brown eyes, and a lean, athletic physique: a result of years of \
martial arts training under the wisdom of his father, a veteran martial arts \
master. His attire consists of a brown USAF bomber jacket, a white T-shirt, \
blue jeans, and white sneakers. The story initially takes place over the \
winter school break, where Ryo's fellow students and friends are preparing for \
their entrance exams for college. At this point, Ryo's mind is set on revenge \
and he no longer expresses any interest in returning to school. As the game \
progresses, Ryo meets a variety of new characters that serve to further the \
narrative of the storyline. The most important of these include Nozomi \
Harasaki, a childhood friend who is romantically interested in Ryo, and Master \
Chen Yaowen, who guides Ryo on his quest. The main antagonist is Lan Di. \
Throughout the game, he is elusive of Ryo. Large sections of the narrative \
revolve around tracking Lan Di down. Two important antagonists that Ryo does \
come into contact with are Chai, a martial arts expert who is devoted to Lan \
Di, and Terry Ryan, who runs a harbor gang known as the Mad Angels.";

if (typeof exports !== 'undefined' && this.exports !== exports)
{
  var requirejs = require('requirejs');

  requirejs.config({
      nodeRequire: require
  });

  var nlplib = requirejs('nlplib');
  console.log(nlplib);

  var fileSystem = require('fs');
  fileSystem.readFile("./models/english.json", function (err, data) {
      if (err)
        console.log(err);
      else {
        nlplib.postagger.fromJSON(data);
        var tagged = nlplib.postagger.tag("New York is the most populous city in the United States and the \
center of the New York metropolitan area, the premier gateway for legal \
immigration to the United States and one of the most populous urban \
agglomerations in the world. The city is referred to as New York City or the \
City of New York to distinguish it from the State of New York, of which it is \
a part. A global power city, New York exerts a significant impact upon \
commerce, finance, media, art, fashion, research, technology, education, and \
entertainment. The home of the United Nations Headquarters, New York is an \
important center for international diplomacy and has been described.");
                  console.log(tagged);
      }
  });
  var fileSystem = require('fs');
  var xmlParser = new require('xml2js').parseString;
  var xmlFileNames = fileSystem.readdirSync("./corpora");
  var progress = 0;

  /*for (i = 0; i < xmlFileNames.length; i++) {
    fileSystem.readFile("./corpora/" + xmlFileNames[i], function (err, data) {
      if (err)
        console.log(err);
      else {
        xmlParser(data, function (err, result) {
          if (err)
            console.log(err);
          else {
            progress++;
            var corpus = [];
            for (i = 0; i < result.graph.a.length; i++) {
              var state, observation, base;
              var index = result.graph.a[i].$.ref.slice(6);

              for (j = 0; j < result.graph.a[i].fs[0].f.length; j++) {
                var propName = result.graph.a[i].fs[0].f[j].$.name;
                var propValue = result.graph.a[i].fs[0].f[j].$.value;

                if (propName === "msd")
                  state = propValue;
                else if (propName === "string")
                  observation = propValue;
                else if (propName === "base")
                  base = propValue;

                if (typeof stateName !== 'undefined' &&
                  typeof observationName !== 'undefined')
                break;
              }

              observation = typeof observation !== 'undefined' ? observation : base;
              corpus[index] = { state: state, observation: observation };
            }

            if (progress < xmlFileNames.length)
              nlplib.postagger.train([corpus]);
            else {
              nlplib.postagger.train([corpus])
                              .finalizeTraining();
              var model = nlplib.postagger.getJSON();
              fileSystem.writeFile("./models/english.json", model, function(err) {
                if(err) {
                  console.log(err);
                }
                else {
                  console.log("The model was saved!");
                  var tagged = nlplib.postagger.tag("Dostoyevsky's literary works explore human psychology in the
                  context of the troubled political, social, and
                  atmosphere of 19th-century Russia.");
                  console.log(tagged);
                }
              });
            }
          }
        });
      }
    });
  }*/
}
else
{
  var nlplib = require(['nlplib'], function (nlplib) {
    console.log(nlplib);
  });
}