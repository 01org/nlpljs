define(['tokenizer'], function (tokenizer) {
  var postagger;

  if (typeof postagger !== 'undefined')
    return postagger;

  var model;
  var stopSymbols = ['.', '?', '!', ';'];

  var nGram = function () {
    return {
      probability: 0,
      frequency: 0
    };
  };

  var hiddenMarkovModel = function () {
    return {
      states: [],
      observations: [],
      unigrams: {},
      bigrams: {},
      trigrams: {},
      emissions: {},
      suffixes: {},
      observationFreqs: {},
      numTokens: 0,
      uniWeight: 0,
      biWeight: 0,
      triWeight: 0,
      suffixWeight: 0,
      addState: function (state) {
        if (this.states.indexOf(state) === -1)
          this.states[this.states.length] = state;

        return this;
      },
      addObservation: function (observation) {
        if (this.observations.indexOf(observation) === -1) {
          this.observations[this.observations.length] = observation;
          this.observationFreqs[observation] = 0;
        }

        this.observationFreqs[observation]++;

        return this;
      },
      addUnigram: function (state) {
        if (typeof this.unigrams[state] === 'undefined')
          this.unigrams[state] = nGram();

        this.unigrams[state].frequency++;
 
        return this;
      },
      addBigram: function (state1, state2) {
        if (typeof this.bigrams[state1] === 'undefined')
          this.bigrams[state1] = {};

        if (typeof this.bigrams[state1][state2] === 'undefined')
          this.bigrams[state1][state2] = nGram();

        this.bigrams[state1][state2].frequency++;

        return this;
      },
      addTrigram: function (state1, state2, state3) {
        if (typeof this.trigrams[state1] === 'undefined')
          this.trigrams[state1] = {};

        if (typeof this.trigrams[state1][state2] === 'undefined')
          this.trigrams[state1][state2] = {};

        if (typeof this.trigrams[state1][state2][state3] === 'undefined')
          this.trigrams[state1][state2][state3] = nGram();

        this.trigrams[state1][state2][state3].frequency++;

        return this;
      },
      addEmission: function (state, observation) {
        if (typeof this.emissions[state] === 'undefined')
          this.emissions[state] = {};

        if (typeof this.emissions[state][observation] === 'undefined')
          this.emissions[state][observation] = nGram();

        this.emissions[state][observation].frequency++;

        return this;
      },
      recalculateProbabilities: function () {
        var averageUnigram = 0;
        this.triWeight = 0;
        this.biWeight = 0;
        this.uniWeight = 0;
        this.suffixWeight = 0;

        for (i in this.unigrams) {
          this.unigrams[i].probability = this.unigrams[i].frequency /
            this.numTokens;

          averageUnigram += this.unigrams[i].probability;

          for (j in this.bigrams[i]) {
            this.bigrams[i][j].probability = this.bigrams[i][j].frequency /
            this.unigrams[i].frequency;

            for (k in this.trigrams[i][j]) {
              var triChecker = biChecker = uniChecker = 0;

              if (this.trigrams[i][j][k].frequency > 1 &&
                  this.bigrams[i][j].frequency > 1) {
                triChecker = (this.trigrams[i][j][k].frequency - 1) /
                  (this.bigrams[i][j].frequency - 1);
              }

              if (this.bigrams[j][k].frequency > 1 &&
                this.unigrams[j].frequency > 1) {
                biChecker = (this.bigrams[j][k].frequency - 1) /
                  (this.unigrams[j].frequency - 1);
              }

              if (this.unigrams[k].frequency > 1 && this.numTokens > 1) {
                uniChecker = (this.unigrams[k].frequency - 1) /
                  (this.numTokens - 1);
              }

              switch (Math.max(triChecker, biChecker, uniChecker)) {
                case triChecker:
                  this.triWeight += this.trigrams[i][j][k].frequency;
                  break;
                case biChecker:
                  this.biWeight += this.trigrams[i][j][k].frequency;
                  break;
                case uniChecker:
                  this.uniWeight += this.trigrams[i][j][k].frequency;
                  break;
              }

              this.trigrams[i][j][k].probability =
                this.trigrams[i][j][k].frequency / this.bigrams[i][j].frequency;
            }
          }

          for (j in this.emissions[i]) {
            this.emissions[i][j].probability = this.emissions[i][j].frequency /
              this.unigrams[i].frequency;

            //if (this.observationFreqs[j] <= 10) {
              var index = 1;
              if (j.length > 11)
                index = j.length - 10;

              if (/[a-zA-Z]/.test(j)) {
                if (j[0] === j[0].toUpperCase())
                  ending = ' ' + 'UPPER';
                else
                  ending = ' ' + 'LOWER'
              }

              while (index < j.length) {
                var suffix = j.slice(index, j.length) + ending;

                if (typeof this.suffixes[suffix] === 'undefined') {
                  this.suffixes[suffix] = { frequency: 0, probability: 0,
                    tags: {} };
                }

                if (typeof this.suffixes[suffix].tags[i] === 'undefined')
                  this.suffixes[suffix].tags[i] = nGram();

                this.suffixes[suffix].frequency++;
                this.suffixes[suffix].tags[i].frequency++;
                index++;
              }
            //}
          }
        }

        for (i in this.suffixes) {
          for (j in this.suffixes[i].tags) {
            this.suffixes[i].tags[j].probability =
              this.suffixes[i].tags[j].frequency / this.suffixes[i].frequency;
          }

          this.suffixes[i].probability = this.suffixes[i].frequency /
            this.numTokens;
        }

        averageUnigram /= this.states.length;

        for (i in this.unigrams) {
          this.suffixWeight += Math.pow(this.unigrams[i].probability -
            averageUnigram, 2);
        }

        var totalWeight = this.triWeight + this.biWeight + this.uniWeight;
        this.triWeight /= totalWeight;
        this.biWeight /= totalWeight;
        this.uniWeight /= totalWeight;
        this.suffixWeight /= this.states.length - 1;

        return this;
      },
      getUnigramProbability: function (state) {
        if (typeof this.unigrams[state] !== 'undefined')
          return this.unigrams[state].probability;

        return 0;
      },
      getBigramProbability: function (state1, state2) {
         if (typeof this.bigrams[state1] !== 'undefined' &&
             typeof this.bigrams[state1][state2] !== 'undefined')
           return this.bigrams[state1][state2].probability;

         return 0;
      },
      getTrigramProbability: function (state1, state2, state3) {
        if (typeof this.trigrams[state1] !== 'undefined' &&
            typeof this.trigrams[state1][state2] !== 'undefined' &&
            typeof this.trigrams[state1][state2][state3] !== 'undefined')
          return this.trigrams[state1][state2][state3].probability;

        return 0;
      },
      getSuffixProbability: function (state, suffix) {

        if (typeof this.suffixes[suffix] !== 'undefined' &&
            typeof this.suffixes[suffix].tags[state] !== 'undefined')
          return this.suffixes[suffix].tags[state].probability;

        return 0;
      },
      getEmissionProbability: function (state, observation) {
        if (typeof this.emissions[state] !== 'undefined' &&
            typeof this.emissions[state][observation] !== 'undefined')
          return this.emissions[state][observation].probability;

        if (this.observations.indexOf(observation) === -1) {
          var index = 1;
          var counter = 0;
          var prevProb = 0;
          var totalProb = 0;
          var ending;

          if (/[a-zA-Z]/.test(observation)) {
            if (observation[0] === observation[0].toUpperCase())
              ending = ' ' + 'UPPER';
            else
              ending = ' ' + 'LOWER'
          }

          if (observation.length > 11)
            index = observation.length - 10;

          while (index < observation.length) {
            var suffix = observation.slice(index, observation.length) + ending;

            if (typeof this.suffixes[suffix] !== 'undefined') {
              var suffixProb = this.getSuffixProbability(state, suffix);

              prevProb = (suffixProb + this.suffixWeight * prevProb) /
                (1 + this.suffixWeight);

              totalProb += (prevProb * this.suffixes[suffix].probability) /
                this.unigrams[state].probability;
            }
            else
              prevProb = 0;

            index++;
            counter++;
          }

          //console.log(observation + " " + state +  " " + totalProb / counter);
          return totalProb / counter;
        }

        return 0;
      },
      decode: function (sequence) {
        var path = [];
        var trellis = [];
        var backpointer = [];
        var failedInit = true;

        trellis[0] = [];
        backpointer[0] = [];
 
        for (i = 0; i < this.states.length; i++) {
          var unigramProb = this.getUnigramProbability(this.states[i]);
          var bigramProb = this.getBigramProbability('SB', this.states[i]);

          trellis[0][i] = (this.uniWeight * unigramProb + this.biWeight *
            bigramProb) * this.getEmissionProbability(this.states[i],
              sequence[0]);

          if (trellis[0][i] > 0)
            failedInit = false;

          backpointer[0][i] = this.states.indexOf('SB');
        }

        if (failedInit === true) {
          if (/[a-zA-Z]/.test(sequence[0])) {
            if (sequence[0][0] === sequence[0][0].toUpperCase())
              trellis[0][this.states.indexOf('NNP UPPER')] = 1;
            else
              trellis[0][this.states.indexOf('NN LOWER')] = 1;
          }

          if (/[0-9]/.test(sequence[0]))
            trellis[0][this.states.indexOf('CD')] = 1;
        }


        for (i = 1; i < sequence.length; i++) {
          trellis[i] = [];
          backpointer[i] = [];

          for (j = 0; j < this.states.length; j++) {
            var unigramProb = this.getUnigramProbability(this.states[j]);
            var emissionProb = this.getEmissionProbability(this.states[j],
                                                             sequence[i]);

            trellis[i][j] = 0;

            for (k = 0; k < this.states.length; k++) {
              var prob = trellis[i - 1][k];
              var trigramProb = 0;
              var bigramProb = this.getBigramProbability(this.states[k],
                                                         this.states[j]);

              if (i > 1) {
                prev = backpointer[i - 1][k];
                if (typeof prev !== 'undefined') {
                  trigramProb = this.getTrigramProbability(this.states[prev],
                                                           this.states[k],
                                                           this.states[j]);
                }
              }

              prob *= (this.uniWeight * unigramProb + this.biWeight *
                bigramProb + this.triWeight * trigramProb) * emissionProb;

              //if (i === sequence.length - 1 )
                //console.log(sequence[i], this.states[j], prob, unigramProb, bigramProb, trigramProb, emissionProb);
              if (prob > trellis[i][j]) {
                trellis[i][j] = prob;
                backpointer[i][j] = k;
                //console.log(sequence[i], this.states[j], this.states[k], prob);
              }
            }

            if (typeof backpointer[i][j] === 'undefined') {
              if (/[a-zA-Z]/.test(sequence[i])) {
                if (sequence[i][0] === sequence[i][0].toUpperCase()) {
                  backpointer[i][j] = this.states.indexOf('NNP UPPER');
                  trellis[i][this.states.indexOf('NNP UPPER')] = 1;
                }
                else {
                  backpointer[i][j] = this.states.indexOf('NN LOWER');
                  trellis[i][this.states.indexOf('NN LOWER')] = 1;
                }
              }
              if (/[0-9]/.test(sequence[i])) {
                backpointer[i][j] = this.states.indexOf('CD');
                trellis[i][this.states.indexOf('CD')] = 1;
              }
            }
          }
        }

        console.log(trellis[sequence.length - 1][this.states.indexOf('SB')]);
        var max = 0;
        for (i = 0; i < this.states.length; i++) {
          console.log(path[sequence.length - 1], trellis[sequence.length - 1][i]);
          if (trellis[sequence.length - 1][i] > max) {
            max = trellis[sequence.length - 1][i];
            path[sequence.length - 1] = this.states[i];
          }
        }

        for (i = sequence.length - 2; i >= 0; i--) {
          var next = backpointer[i + 1][this.states.indexOf(path[i + 1])];
          path[i] = this.states[next];
        }

        return path;
      }
    };
  };

  var parseCorpus = function (corpus) {
    var history = [];

    for (i = 0; i < corpus.length; i++) {
      var state = corpus[i].state;

      if (/[a-zA-Z]/.test(corpus[i].observation[0])) {
        if (corpus[i].observation[0] === corpus[i].observation[0].toUpperCase())
          state = corpus[i].state + ' ' + 'UPPER';
        else
          state = corpus[i].state + ' ' + 'LOWER'
      }

      if (stopSymbols.indexOf(corpus[i].observation) !== -1 || state === '.')
        state = 'SB';

      model.addState(state)
           .addObservation(corpus[i].observation)
           .addUnigram(state)
           .addEmission(state, corpus[i].observation);

      if (history.length > 0) {
        model.addBigram(history[history.length - 1].state, state);

        if (history.length > 1) {
          model.addTrigram(history[history.length - 2].state,
                           history[history.length - 1].state, state);
        }
      }
      else {
        history[history.length] = { state: 'SB', observation: '' };
        model.addState('SB')
             .addUnigram('SB')
             .addBigram('SB', state);
      }

      history[history.length] = { state: state,
                                  observation: corpus[i].observation };

      model.numTokens++;
    }
  };

  postagger =  {
    tag: function (text) {
      var tokenized = tokenizer.tokenize(text);
      var tagged = [];
      var tagSeq = model.decode(tokenized);

      for (i = 0; i < tagSeq.length; i++) {

        var index = tagSeq[i].indexOf(' ');
        var tag = tagSeq[i];

        if (index > -1)
          tag = tagSeq[i].slice(0, index);

        tagged[i] = { token: tokenized[i], tag: tag };
      }

      return tagged;
    },
    train: function (corpora) {
      if (typeof model === 'undefined')
        model = hiddenMarkovModel();

      for (i = 0; i < corpora.length; i++)
        parseCorpus(corpora[i]);

      return this;
    },
    finalizeTraining: function () {
      model.recalculateProbabilities();
      return this;
    },
    fromJSON: function (jsonFile) {
      var data = JSON.parse(jsonFile);
      model = hiddenMarkovModel();

      model.states = data.states,
      model.observations = data.observations;
      model.unigrams = data.unigrams;
      model.bigrams = data.bigrams;
      model.trigrams = data.trigrams;
      model.emissions = data.emissions;
      model.suffixes = data.suffixes;
      model.observationFreqs = data.observationFreqs;
      model.numTokens = data.observationFreqs;
      model.uniWeight = data.uniWeight;
      model.biWeight = data.biWeight;
      model.triWeight = data.triWeight;
      model.suffixWeight = data.suffixWeight;

      return this;
    },
    getJSON: function () {
      return JSON.stringify(model, null, 4);;
    }
  };

  return postagger;
});