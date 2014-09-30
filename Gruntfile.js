// Generated on 2014-07-21 using generator-chromeapp 0.2.11
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

// get the latest commit ID as an 8-character string;
// if not a git repo, returns '' and logs an error;
// receiver is a function with the signature receiver(err, result),
// where err is null if no error occurred and result is the commit ID
var gitCommitId = function (receiver) {
  exec('git log -n1 --format=format:\'%h\'', function (err, stdout) {
    if (err) {
      receiver(err);
    }
    else {
      var commitId = stdout.replace(/'/g, '');
      receiver(null, commitId);
    }
  });
};

module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths
    var config = {
        app: 'app',
        build: 'build',
        dist: 'dist',
        tasks: grunt.cli.tasks,
        packageInfo: grunt.file.readJSON('package.json')
    };

    // path to the version.json file generated as part of the dist task
    config.versionFilePath = path.join(config.dist, 'version.json');

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['bowerInstall']
            },
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['<%= config.app %>/styles/{,*/}*.css'],
                tasks: [],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                tasks: ['less:development'],
                files: [
                    '.tmp/styles/{,*/}*.css',
                    '<%= config.app %>/*.html',
                    '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= config.app %>/manifest.json',
                    '<%= config.app %>/_locales/{,*/}*.json',
                    "<%= config.app %>/content-push/styles/content-push.less"
                ]
            }
        },

        less: {
            development: {
                options: {
                    paths: ["<%= config.app %>/content-push/styles"]
                },
                files: {"<%= config.app %>/content-push/styles/content-push.css": "<%= config.app %>/content-push/styles/content-push.less"}
            },
            production: {
                options: {
                    paths: ["<%= config.app %>/content-push/styles"],
                    cleancss: true
                },
                files: {"<%= config.app %>/content-push/styles/content-push.css": "<%= config.app %>/content-push/styles/content-push.less"}
            }
        },

        // Grunt server and debug server settings
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost',
                open: true,
            },
            server: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(config.app)
                        ];
                    }
                }
            },
            chrome: {
                options: {
                    open: false,
                    base: [
                        '<%= config.app %>'
                    ]
                }
            },
            test: {
                options: {
                    open: false,
                    base: [
                        'test',
                        '<%= config.app %>'
                    ]
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            server: '.tmp',
            chrome: '.tmp',
            build: {
                files: [{
                    src: [
                        '<%= config.build %>/*',
                        '!<%= config.build %>/.git*'
                    ]
                }]
            },
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },

        // grunt-mochaccino options; runs the tests in the test/unit
        // directory on the command line (rather than in a browser)
        mochaccino: {
          all: {
            files: [
              { src: 'test/unit/*.test.js' }
            ]
          }
        },

        // Automatically inject Bower components into the HTML file
        bowerInstall: {
            app: {
                src: ['<%= config.app %>/app.html'],
                ignorePath: '<%= config.app %>/'
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: [
                '<%= config.build %>/app.html'
            ]
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
            },
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.build %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.build %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    customAttrAssign: [/\?=/],
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: '{,*/}*.html',
                    dest: '<%= config.dist %>'
                }]
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //     dist: {
        //         files: {
        //             '<%= config.dist %>/styles/main.css': [
        //                 '.tmp/styles/{,*/}*.css',
        //                 '<%= config.app %>/styles/{,*/}*.css'
        //             ]
        //         }
        //     }
        // },
        // uglify: {
        //     dist: {
        //         files: {
        //             '<%= config.dist %>/scripts/scripts.js': [
        //                 '<%= config.dist %>/scripts/scripts.js'
        //             ]
        //         }
        //     }
        // },
        // concat: {
        //     dist: {}
        // },

        copy: {
            // Copies all files into build directory for vulcanization
            build: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.build %>',
                    src: [
                        '**', '!**/*.less'
                    ]
                }]
            },

            vulcanized: {
                options: {
                    // move the csp js file into usemin block
                    process: function (content, srcpath) {
                      var useminComment = '<!-- build:js scripts/index.js -->';
                      function moveToUsemin(script) {
                        // extract the csp js script line
                        var cspStart = content.indexOf(script);
                        if (cspStart!=-1) {
                          var cspEnd   = cspStart+script.length;
                          var cspJs = content.slice(cspStart,cspEnd); // CR

                          // cut it out
                          content = content.substring(0,cspStart).concat(
                              content.substring(cspEnd)
                          );

                          // insert it into the usemin block
                          var useminEnd = content.indexOf(useminComment)+useminComment.length; // next line
                          content = content
                              .substring(0,useminEnd+1) // end of useminComment - include CR
                              .concat(
                                  cspJs, // insert
                                  content.substring(useminEnd) // after end of useminComment - include CR (again)
                              );
                        }
                      }

                      moveToUsemin('<script src="index-csp.js"></script>');
                      moveToUsemin('<script src="bower_components/polymer/polymer.js"></script>');
                      moveToUsemin('<script src="bower_components/platform/platform.js"></script>');
                      return content;
                    }
                },
                src: 'build/index-csp.html',
                dest: 'build/index.html',
            },

            // Copies remaining files to places other tasks can use; broken
            broken_dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.build %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.{webp,gif}',
                        '{,*/}*.html',
                        'styles/fonts/{,*/}*.*',
                        '_locales/{,*/}*.json',
                    ]
                }]
            },

            dist: {
              files: [{
                  expand: true,
                  dot: true,
                  cwd: '<%= config.build %>',
                  dest: '<%= config.dist %>',
                  src: [
                      '**'
                  ]
              }]
            },

            styles: {
                expand: true,
                dot: true,
                cwd: '<%= config.build %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            chrome: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin'
            ],
            test: [
                'copy:styles'
            ],
        },

        // Merge event page, update build number, exclude the debug script
        chromeManifest: {
            dist: {
                options: {
                    buildnumber: true,
                    background: {
                        target: 'scripts/background.js',
                        exclude: [
                            'scripts/chromereload.js'
                        ]
                    }
                },
                src: '<%= config.build %>',
                dest: '<%= config.dist %>'
            }
        },

        // Compress files in dist to make Chromea Apps package
        compress: {
            dist: {
                options: {
                    archive: function() {
                        var manifest = grunt.file.readJSON('app/manifest.json');
                        return 'package/kindle_in_webview-' + manifest.version + '.zip';
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        },

        vulcanize: {
            default: {
                options: {
                    'csp': true
                },
                files: {
                    '<%= config.build %>/index-csp.html': '<%= config.build %>/index.html'
                }
            }
        },

        remove: {
          unvulcanized: {
            fileList: ['<%= config.build %>/index.html']
          },
          vulcanized: {
            fileList: ['<%= config.build %>/index-csp.html']
          }
        }
    });

    grunt.registerTask('debug', function (platform) {
        var watch = grunt.config('watch');
        platform = platform || 'chrome';

        // Configure style task for debug:server task
        if (platform === 'server') {
            watch.styles.tasks = ['newer:copy:styles'];
            watch.styles.options.livereload = false;
        }

        // Configure updated watch task
        grunt.config('watch', watch);

        grunt.task.run([
            'clean:' + platform,
            'concurrent:' + platform,
            'connect:' + platform,
            'watch'
        ]);
    });

    grunt.registerTask('test-with-server', [
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('test', ['mochaccino:all']);

    grunt.registerTask('build', [
        'clean:build',
        'less:production',
        'copy:build'
    ]);

    // This is the original dist task added when the gruntfile was
    // generated; it's maintained here as a reminder of the sequence
    // of steps required for a full build, in case we decide we ever
    // need to fix it (it is broken right now)
    grunt.registerTask('broken_dist', [
        'clean:dist',
        'copy:broken_dist',
        'chromeManifest:dist',
        'useminPrepare',
        'concurrent:dist',
        'concat',
        'cssmin',
        'uglify',
        'copy:styles',
        'usemin',
        'htmlmin',
        'compress'
    ]);

    // creates a file <build.dist>/version.json with information about
    // the date and time of the build, git commit ID, and package.json version
    grunt.registerTask('dist-version', function () {
      var done = this.async();

      var meta = {
        version: config.packageInfo.version,
        gitCommit: null,
        buildDate: new Date()
      };

      gitCommitId(function (err, result) {
        if (err) {
          done(err);
        }
        else {
          meta.gitCommit = result;

          fs.writeFileSync(config.versionFilePath, JSON.stringify(meta));

          done();
        }
      });
    });

    // simplified dist with no minification
    grunt.registerTask('dist', ['build', 'copy:dist', 'dist-version']);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
