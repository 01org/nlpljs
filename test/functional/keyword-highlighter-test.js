(function keywordHighlighterTest() {
  var self;

  Polymer({
    created: function() {
      self=this;
    },

    ready: function() {
      this.testSplitAtPosition();

      // from NLP
      var testInput=[

        // overlapping range
        {
          groupId: 0,
          start: {
            charNo: 0,
            lineNo: 0,
          },
          end: {
            charNo: 17,
            lineNo: 0,
          },
        },

        // overlaps above range
        {
          groupId: 5,
          end: {
            charNo: 6,
            lineNo: 0,
          },
          start: {
            charNo: 0,
            lineNo: 0,
          },
        },

        // same line
        // in group 1
        {
          groupId: 1,
          start: {
            lineNo: 0,
            charNo: 4
          },
          end: {
            lineNo: 0,
            charNo: 10
          }
        },

        // two lines
        // in group 1
        {
          groupId: 1,
          start: {
            lineNo: 2,
            charNo: 5
          },
          end: {
            lineNo: 2,
            charNo: 15
          }
        },

        // three lines
        // in group 2
        {
          groupId: 2,
          start: {
            lineNo: 6,
            charNo: 4
          },
          end: {
            lineNo: 9,
            charNo: 2
          }
        },

      ];

      this.$.highlighter.targetElement = this.$.page;

      this.$.highlighter.prepare(testInput);

      // turn on group 1
      this.$.highlighter.turn(1,'on');

      // after two seconds, turn on group 2
      setTimeout(function() {
        self.$.highlighter.turn(2,'on');
      },2000);

      // 5 seconds later, remove groupId=1 elements
      setTimeout(function() {
        self.$.highlighter.clear(1);
      }, 5000);

      // ten seconds later, remove groupId=2 elements
      setTimeout(function() {
        self.$.highlighter.clear(2);
      }, 10000);

    },

    testSplitAtPosition: function() {
      var testMethod=this.$.highlighter.testSplitAtPosition;
      var tests=[

        // notice failure, so adding as a test case
        {
          input: {
            position: 25,
            chars:
  '<span style="display: inline-block; height: 10000px"></span><span style="display: inline-block; position:relative; top: -9985.92px;"><span class="goog-inline-block kix-lineview-text-block" style="width: 621px; padding-left: 0px;"><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">The&nbsp;</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">Battle&nbsp;of&nbsp;Hastings</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">&nbsp;was&nbsp;fought&nbsp;on&nbsp;14&nbsp;October&nbsp;1066&nbsp;between&nbsp;the&nbsp;Norman-French&nbsp;army&nbsp;of<span class="goog-inline-block" style="width:4.16748046875px;height:17.599999999999998px">&nbsp;</span></span></span></span>'
          },
          output: {
            before: '<span style="display: inline-block; height: 10000px"></span><span style="display: inline-block; position:relative; top: -9985.92px;"><span class="goog-inline-block kix-lineview-text-block" style="width: 621px; padding-left: 0px;"><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">The&nbsp;</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">Battle&nbsp;of&nbsp;Hastings</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">&nbsp;wa',
            after: 's&nbsp;fought&nbsp;on&nbsp;14&nbsp;October&nbsp;1066&nbsp;between&nbsp;the&nbsp;Norman-French&nbsp;army&nbsp;of<span class="goog-inline-block" style="width:4.16748046875px;height:17.599999999999998px">&nbsp;</span></span></span></span>'
          }
        },

        // simple test of failing case
        {
          input: {
            position: 4,
            chars:
  '<span>&nbsp;was&nbsp;<span>&nbsp;</span></span>'
          },
          output: {
            before: "<span>&nbsp;was",
            after: "&nbsp;<span>&nbsp;</span></span>"
          }
        },

        // simple test
        {
          input: {
            position: 5,
            chars: '<div>1234567890</div>'
          },
          output: {
            before: '<div>12345',
            after: '67890</div>'
          }
        },

        // split just before html
        // function is greedy, so it pushes html into the .before
        // I think this doesn't matter
        {
          input: {
            position: 5,
            chars: '<div>12345<div></div>67890</div>'
          },
          output: {
            before: '<div>12345<div></div>',
            after: '67890</div>'
          }
        },

        // test counting '&nbsp;'
        {
          input: {
            position: 5,
            chars: '<div>1234&nbsp;567890</div>'
          },
          output: {
            before: '<div>1234&nbsp;',
            after: '567890</div>'
          }
        },

        // test counting '&nbsp;' right before div
        {
          input: {
            position: 5,
            chars: '<div>1234&nbsp;<div></div>567890</div>'
          },
          output: {
            before: '<div>1234&nbsp;<div></div>',
            after: '567890</div>'
          }
        },

        // test splitting before any html
        {
          input: {
            position: 5,
            chars: '1234&nbsp;<div></div>567890</div>'
          },
          output: {
            before: '1234&nbsp;<div></div>',
            after: '567890</div>'
          }
        },

        // test splitting after any html
        {
          input: {
            position: 7,
            chars: '1234&nbsp;<div></div>567890'
          },
          output: {
            before: '1234&nbsp;<div></div>56',
            after: '7890'
          }
        },

      ];

      for (var i=0;i<tests.length;++i) {
        var actualOutput=testMethod(tests[i].input.position,tests[i].input.chars);
        if (actualOutput.before===tests[i].output.before
            && actualOutput.after===tests[i].output.after) {
          //console.log('SUCCESS');
        } else {
          console.log('FAILURE');
          console.log('expected:',tests[i].output);
          console.log('got:',actualOutput);
        }
      };
    },

  });

})();

