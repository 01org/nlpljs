(function keywordHighlighterTest() {

  Polymer({
    created: function() {
    },

    ready: function() {
      var self=this;
      this.$.button.addEventListener('click',function() {
        self.testSplitAtPosition();

        self.testHighlighting();
      });
    },

    testHighlighting: function() {
      // from NLP
      var testInput=[

        {
          groupId: 0,
          start: {
            charNo: 70,
            lineNo: 0,
          },
          end: {
            charNo: 83,
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

      var self=this;
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

        {
          comment: 'end of string',
          input: {
            endian: 'end',
            position: 7,
            chars: 'Hastings',
          },
          output: {
            before:
              'Hastings',
            after:
              '',
          }
        },

        {
          comment: 'end of string with html before *and* after it',
          input: {
            endian: 'end',
            position: 7,
            chars: '<span>Hastings<span>',
          },
          output: {
            before:
              '<span>Hastings',
            after:
              '<span>',
          }
        },

        {
          comment: 'Trimmed Kind Harold II - end of string',
          input: {
            endian: 'end',
            position: 13,
            chars:
              '<span>King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II</span></a><span>,<span>&nbsp;</span></span></span>'
          },
          output: {
            before:
              '<span>King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II',
            after:
              '</span></a><span>,<span>&nbsp;</span></span></span>'
          }
        },

        {
          comment: 'End of string, but no tag at start of string',
          input: {
            endian: 'end',
            position: 13,
            chars:
              'King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II</span></a><span>,<span>&nbsp;</span></span></span>'
          },
          output: {
            before:
              'King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II',
            after:
              '</span></a><span>,<span>&nbsp;</span></span></span>'
          }
        },

        {
          comment: 'End of King Harold II',
          input: {
            endian: 'end',
            position: 83,
            chars:
              '<span><span>Duke<span>&nbsp;</span></span><a><span>William<span>&nbsp;</span>II<span>&nbsp;</span>of<span>&nbsp;</span>Normandy</span></a><span><span>&nbsp;</span>and<span>&nbsp;</span>an<span>&nbsp;</span>English<span>&nbsp;</span>army<span>&nbsp;</span>under<span>&nbsp;</span>the<span>&nbsp;</span></span><a><span>Anglo-Saxon</span></a><span><span>&nbsp;</span>King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II</span></a><span>,<span>&nbsp;</span></span></span>'
          },
          output: {
            before:
              '<span><span>Duke<span>&nbsp;</span></span><a><span>William<span>&nbsp;</span>II<span>&nbsp;</span>of<span>&nbsp;</span>Normandy</span></a><span><span>&nbsp;</span>and<span>&nbsp;</span>an<span>&nbsp;</span>English<span>&nbsp;</span>army<span>&nbsp;</span>under<span>&nbsp;</span>the<span>&nbsp;</span></span><a><span>Anglo-Saxon</span></a><span><span>&nbsp;</span>King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II',
            after:
              '</span></a><span>,<span>&nbsp;</span></span></span>'
          }
        },

        {
          comment: 'skip intermediate tag to get to beginning of keyword',
          input: {
            endian: 'begin',
            position: 1,
            chars:
              '<span>&nbsp;</span>King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II</span></a><span>,<span>&nbsp;</span></span></span>'
          },
          output: {
            before:
              '<span>&nbsp;</span>',
            after:
              'King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II</span></a><span>,<span>&nbsp;</span></span></span>'
          }
        },

        {
          comment: 'beginning of string with html before it',
          input: {
            endian: 'begin',
            position: 0,
            chars: '<span>Hastings',
          },
          output: {
            before:
              '<span>',
            after:
              'Hastings',
          }
        },

        {
          comment: 'begin of string - not position 0 with embedded tag',
          input: {
            endian: 'begin',
            position: 3,
            chars: '<span>Ha<span>stings<span>',
          },
          output: {
            before:
              '<span>Ha<span>s',
            after:
              'tings<span>',
          }
        },

        {
          comment: 'begin of string - not position 0',
          input: {
            endian: 'begin',
            position: 3,
            chars: '<span>Hastings<span>',
          },
          output: {
            before:
              '<span>Has',
            after:
              'tings<span>',
          }
        },

        {
          comment: 'beginning of string',
          input: {
            endian: 'begin',
            position: 0,
            chars: 'Hastings',
          },
          output: {
            before:
              '',
            after:
              'Hastings',
          }
        },

        {
          comment: 'end of string with html after it',
          input: {
            endian: 'end',
            position: 7,
            chars: 'Hastings<span>',
          },
          output: {
            before:
              'Hastings',
            after:
              '<span>',
          }
        },

        {
          comment: 'beginning of string with html before *and* after it',
          input: {
            endian: 'begin',
            position: 0,
            chars: '<span>Hastings<span>',
          },
          output: {
            before:
              '<span>',
            after:
              'Hastings<span>',
          }
        },

        {
          comment: 'beginning of string with two html tags before it',
          input: {
            endian: 'begin',
            position: 0,
            chars: '<span><span>Hastings<span>',
          },
          output: {
            before:
              '<span><span>',
            after:
              'Hastings<span>',
          }
        },

        {
          comment: 'end of string with two html tags before it',
          input: {
            endian: 'end',
            position: 7,
            chars: '<span><span>Hastings<span>',
          },
          output: {
            before:
              '<span><span>Hastings',
            after:
              '<span>',
          }
        },

        {
          comment: 'end of string with embedded html tag in it',
          input: {
            endian: 'end',
            position: 7,
            chars: '<span>Ha<span>stings<span>',
          },
          output: {
            before:
              '<span>Ha<span>stings',
            after:
              '<span>',
          }
        },

        {
          comment: 'end of string with two embedded html tag in it',
          input: {
            endian: 'end',
            position: 7,
            chars: '<span>Ha<span>sti<span>ngs<span>',
          },
          output: {
            before:
              '<span>Ha<span>sti<span>ngs',
            after:
              '<span>',
          }
        },

        {
          comment: 'end of Hastings - check we get the "s"',
          input: {
            endian: 'end',
            position: 7,
            chars:
'Hastings<span class="goog-inline-block" style="width:27.5px;height:65.6px">&nbsp;</span></span></span></span></div></div>'
          },
          output: {
            before:'Hastings',
            after:'<span class="goog-inline-block" style="width:27.5px;height:65.6px">&nbsp;</span></span></span></span></div></div>'
          }
        },

        {
          comment: 'beginning of King - lots of text/tags before',
          input: {
            endian: 'begin',
            position: 70,
            chars:
              '<span><span>Duke<span>&nbsp;</span></span><a><span>William<span>&nbsp;</span>II<span>&nbsp;</span>of<span>&nbsp;</span>Normandy</span></a><span><span>&nbsp;</span>and<span>&nbsp;</span>an<span>&nbsp;</span>English<span>&nbsp;</span>army<span>&nbsp;</span>under<span>&nbsp;</span>the<span>&nbsp;</span></span><a><span>Anglo-Saxon</span></a><span><span>&nbsp;</span>King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II</span></a><span>,<span>&nbsp;</span></span></span>'
          },
          output: {
            before:
              '<span><span>Duke<span>&nbsp;</span></span><a><span>William<span>&nbsp;</span>II<span>&nbsp;</span>of<span>&nbsp;</span>Normandy</span></a><span><span>&nbsp;</span>and<span>&nbsp;</span>an<span>&nbsp;</span>English<span>&nbsp;</span>army<span>&nbsp;</span>under<span>&nbsp;</span>the<span>&nbsp;</span></span><a><span>Anglo-Saxon</span></a><span><span>&nbsp;</span>',
            after:
              'King<span>&nbsp;</span></span><a><span>Harold<span>&nbsp;</span>II</span></a><span>,<span>&nbsp;</span></span></span>'
          }
        },

        {
          comment: 'simple test of failing case',
          input: {
            endian: 'end',
            position: 4,
            chars:
  '<span>&nbsp;was&nbsp;<span>&nbsp;</span></span>'
          },
          output: {
            before: '<span>&nbsp;was&nbsp;',
            after: '<span>&nbsp;</span></span>'
          }
        },

        {
          comment: 'notice failure, so adding as a test case',
          input: {
            endian: 'end',
            position: 3,
            chars: 'MAX&nbsp;</span>',
          },
          output: {
            before: 'MAX&nbsp;',
            after: '</span>'
          }
        },

        {
          comment: 'notice failure, so adding as a test case',
          input: {
            endian: 'begin',
            position: 25,
            chars:
  '<span style="display: inline-block; height: 10000px"></span><span style="display: inline-block; position:relative; top: -9985.92px;"><span class="goog-inline-block kix-lineview-text-block" style="width: 621px; padding-left: 0px;"><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">The&nbsp;</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">Battle&nbsp;of&nbsp;Hastings</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">&nbsp;was&nbsp;fought&nbsp;on&nbsp;14&nbsp;October&nbsp;1066&nbsp;between&nbsp;the&nbsp;Norman-French&nbsp;army&nbsp;of<span class="goog-inline-block" style="width:4.16748046875px;height:17.599999999999998px">&nbsp;</span></span></span></span>'
          },
          output: {
            before: '<span style="display: inline-block; height: 10000px"></span><span style="display: inline-block; position:relative; top: -9985.92px;"><span class="goog-inline-block kix-lineview-text-block" style="width: 621px; padding-left: 0px;"><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">The&nbsp;</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:bold;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">Battle&nbsp;of&nbsp;Hastings</span><span class="kix-wordhtmlgenerator-word-node" style="font-size:15px;font-family:Arial;color:#252525;background-color:transparent;font-weight:normal;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;">&nbsp;wa',
            after: 's&nbsp;fought&nbsp;on&nbsp;14&nbsp;October&nbsp;1066&nbsp;between&nbsp;the&nbsp;Norman-French&nbsp;army&nbsp;of<span class="goog-inline-block" style="width:4.16748046875px;height:17.599999999999998px">&nbsp;</span></span></span></span>'
          }
        },

        {
          comment: 'simple test',
          input: {
            endian: 'begin',
            position: 5,
            chars: '<div>1234567890</div>'
          },
          output: {
            before: '<div>12345',
            after: '67890</div>'
          }
        },

        {
          comment: 'split just before html',
          input: {
            endian: 'begin',
            position: 5,
            chars: '<div>12345<div></div>67890</div>'
          },
          output: {
            before: '<div>12345<div></div>',
            after: '67890</div>'
          }
        },

        {
          comment: 'test counting &nbsp;',
          input: {
            endian: 'begin',
            position: 5,
            chars: '<div>1234&nbsp;567890</div>'
          },
          output: {
            before: '<div>1234&nbsp;',
            after: '567890</div>'
          }
        },

        {
          comment: 'test counting &nbsp; right before div',
          input: {
            endian: 'begin',
            position: 5,
            chars: '<div>1234&nbsp;<div></div>567890</div>'
          },
          output: {
            before: '<div>1234&nbsp;<div></div>',
            after: '567890</div>'
          }
        },

        {
          comment: 'test splitting before any html',
          input: {
            endian: 'begin',
            position: 5,
            chars: '1234&nbsp;<div></div>567890</div>'
          },
          output: {
            before: '1234&nbsp;<div></div>',
            after: '567890</div>'
          }
        },

        {
          comment: 'test splitting after any html',
          input: {
            endian: 'begin',
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
        var thisTest=tests[i];
        console.log('Test:',i+':'+thisTest.comment);
        var actualOutput=null;
        if (thisTest.input.endian) {
          actualOutput=testMethod(thisTest.input.position,thisTest.input.chars,thisTest.input.endian);
        } else {
          actualOutput=testMethod(thisTest.input.position,thisTest.input.chars);
        }

        if (actualOutput.before===thisTest.output.before
            && actualOutput.after===thisTest.output.after) {
          console.log('SUCCESS:',i);
        } else {
          console.log('FAILURE: test index:',i);
          console.log('test input:',thisTest.input);
          console.log('expected:',thisTest.output);
          console.log('got:',actualOutput);
        }
      };
    },

  });

})();

