
module.exports = function(grunt) {
    
    "use strict";
    /*jslint nomen: true, plusplus: true */
    /*global grunt, process */
    
    // If we don't yet have a user's build file, create it.
    if (!grunt.file.isFile('me.build.json')) {
        
        grunt.file.write('me.build.json',
            JSON.stringify({
                deployLocation: ''
            }, null, 4)
        );
        
        grunt.fail.fatal("me.build.json file is needed! \n" +
            "One was just created from template. You should Edit it." );
        return;
        
    }
    
    var userOpt     = grunt.file.readJSON('me.build.json'),
        pkgSetup    = grunt.file.readJSON('package.json'),
        buildDate   = grunt.template.today('yyyy-mm-dd'),
        buildYear   = grunt.template.today('yyyy'),
        buildId     = (new Date()).getTime(),
        fs          = require('fs'),
        path        = require('path');
    
    
    /**
     * includeFile() - embeds a file content within another. Meant to be
     * used from the copy task as a 'processContent' function.
     * 
     * @param {String} fileContent
     * @param {String} filePath
     * 
     * @return {String} fileContent
     */
    function includeFile(fileContent, filePath){
        
        if (fileContent.indexOf("BUILD_INCLUDE") > -1) {
            
            grunt.log.write("includeFile(): [" + filePath + "] has BUILD_INCLUDE: ");
            
            // Match:
            //      // BUILD_INCLUDE('file')
            //      /* BUILD_INCLUDE('file') */
            //      <!-- BUILD_INCLUDE("file") -->
            //
            var re = /(?:(?:\/\/)|(?:\<\!\-\-)|(?:\/\*)) {0,}BUILD_INCLUDE\(['"](.*)['"]\)(?:.*)/i,
                match, file;
            
            while ((match = re.exec(fileContent)) !== null) {
                
                grunt.log.write(".");
                grunt.verbose.writeln("    Match array: " + match );
                
                file = grunt.template.process( match[1] );
                
                grunt.verbose.writeln("    File to embed: " + file );
                
                file        = grunt.file.read( file );
                fileContent = fileContent.replace(match[0], function(){
                                return file;
                            });
                
            }
            grunt.log.writeln("");
            return fileContent;
            
        }
        
        return fileContent;
        
    } //end: includeFile()
    
    /**
     * Repaces build variables in files with actual values. Meant to be used
     * with the 'copy' task as a contentProcess function
     * 
     * @param {String} fileContent
     * @param {String} srcPath
     * 
     * @return {String}
     */
    function replaceBuildVariables(fileContent, srcPath){
        
        grunt.verbose.writeln("Processing : " + srcPath );
        
        return fileContent
            .replace( /@BUILD/g, buildId)
            .replace( /@VERSION/g, grunt.template.process("<%= pkg.version %>"))
            .replace( /@DATE/g, buildDate )
            .replace( /@YEAR/g, buildYear );
        
    } //end: replaceBuildVariables()

    /**
     * Retuns a function that can be used with grunt's copy
     * task 'filter' option. Checks if file being copied
     * is newer than that destination file.
     * 
     * @param {Object} target
     *      The config object from copy task.
     * @param {String} timestampFile
     *      A timestamp file. Will be used instead of accessing the
     *      destination file when detemining if file should be copied.
     * 
     * @return {Boolean}
     *      True - yes, its new
     *      false - no, its not new
     * 
     * @see {https://github.com/gruntjs/grunt-contrib-copy/issues/78#issuecomment-19027806}
     * 
     */
    function onlyNew(target, timestampFile) {
        
        var newTimestamp,
            taskCreated     = false;
        
        return function(src) {
            
            var dest    = grunt.config(target.concat('dest')),
                cwd     = grunt.config(target.concat('cwd')),
                dstat, stat, response;
            
            dest = cwd ? path.join(dest, path.relative(cwd, src)) : path.join(dest, src);
            
            // grunt.log.writeln("this.target: " + this.name);
            
            grunt.verbose.writeln("Src  File: " + src);
            grunt.verbose.writeln("Dest File: " + dest);
            
            try {
                
                dstat   = fs.statSync(dest);
                stat    = fs.statSync(src);
            
            } catch (e) {
                
                // grunt.log.writeln("    Unable to get stat data... Returning True");
                
                return true;
                
            }
            
            // grunt.log.writeln("    Src  is File: " + stat.isFile() + " | mTime: " + stat.mtime.getTime());
            // grunt.log.writeln("    Dest is File: " + dstat.isFile() + " | mTime: " + dstat.mtime.getTime());
            
            // grunt.log.writeln("mod[" + dstat.mtime.getTime() + "]: " + dest);
            
            response = ( stat.isFile() && stat.mtime.getTime() > dstat.mtime.getTime() );
            
            // grunt.log.writeln("    Response: " + response);
            
            return response;
            
        };
        
    } //end: onlyNew()
    
    
    // ----------------
    // Validations
    // ----------------
    if (!userOpt.buildLocation) {
        
        grunt.fail.fatal("me.build.json: missing buildLocation value!" );
        
        return;
        
    }     
    
    // Expand any templates in buildLocation... Uses custom data for expansion.
    userOpt.buildLocation = grunt.template.process(
        userOpt.buildLocation,
        {
            data: {
                ENV: process.env
            }
        }
    );
    
    // If build folder does not exist, error.
    if (    !grunt.file.exists(userOpt.buildLocation)
        ||  !grunt.file.isDir(userOpt.buildLocation)
    ) {
        
        grunt.fail.fatal("me.build.json: buildLocation [" + 
            userOpt.buildLocation + "] does not exist or not a directory!" );
        
        return;
    
    }
    
    // If the build folder is the same as this directory, error.
    if (grunt.file.isPathCwd(userOpt.buildLocation)) {
        
        grunt.fail.fatal("me.build.json: buildLocation cannot be current directory (cwd)!" );
        
        return;
    
    }
    
    // Task configuration.
    grunt.initConfig({
        
        pkg: pkgSetup,
        
        ENV: process.env,   
        
        userOpt: userOpt,
        
        buildRootDir: userOpt.buildLocation + '/<%= pkg.name %>/',
        
        buildDir: '<%= buildRootDir %>buildConfig/',
        
        newer: {
            options: {
                cache: '<%= buildDir %>'
            }
        },
        
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> v<%= pkg.version %> | (c) ' +
                        '<%= grunt.template.today("yyyy") %> <%= pkg.author %> */\n'
            }
            
            
        }, //end: uglify
        
        copy: {
            
            options : {
        
                processContentExclude: [
                    '**/*.{png,gif,jpg,ico,psd}'
                ]
        
            },
                    
            stage: {
                src:    [
                    'src/**/*'
                ],
                dest:       '<%= buildRootDir %>',
                expand:     true,
                options:    {
                    processContent: function(data, file) {
                        
                        var updatedContent = data;
                        
                        updatedContent = replaceBuildVariables(data, file);
                        
                        return updatedContent;
                        
                    } //end: processContent()
                }
            }, //end: copy:stage
            
            build: {
                src:        'src/ui/**/*',
                dest:       '<%= buildRootDir %>/build/',
                expand:     true,
                flatten:    true,
                options:    {
                    
                    processContent: function(data, file) {
                        
                        var updatedContent = data;
                        
                        updatedContent = replaceBuildVariables(data, file);
                        updatedContent = includeFile(updatedContent, file);
                        
                        return updatedContent;
                        
                    } //end: processContent()
                    
                }
                
            },
            
            deploy: {
                options : {
            
                    processContentExclude: [
                        '**/*.*'
                    ]
            
                },  
                cwd:    '<%= buildRootDir %>/build/',
                expand: true,
                filter: onlyNew(['copy', 'deploy']),
                src:    ['**/*'],
                dest:   userOpt.deployLocation
            }
           
            
        }, //end: copy
        
        watch: {
            
            options: {
                nospawn: true
            },
            
            all: {
                options: {
                    nospawn: true
                },
                files: 'src/**',
                tasks: ["deploy"]
            }
            
        }, //end: watch
        
        clean: {
            
            options: {
                force: true
            },
            
            all: [
                '<%= buildRootDir %>'
            ],
            
            build: [
                '<%= buildRootDir %>/build/**/*'
            ]
            
        }, // end: clean
        
        concat: {
            
        } //end: concat
        
    }); //end: config()
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-newer');
    
    /**
     * On watch event: change copy.build.src value to only
     * include the changed file.
     */
    grunt.event.on('watch', function(action, filepath) {
        
    });
    
    /**
     * Default TASK
     * Run build
     */
    grunt.registerTask('default', ['build']);
    
    /**
     * BUILD
     * Builds the appliation.
     */
    grunt.registerTask('build', [
        "clean:build", 
        "newer:copy:stage", 
        "newer:copy:build"
    ]);
        
    
    /**
     * Deploy task
     * Will use the my.build.json settings to
     * copy content from the build folder to the deploy destination.
     * 
     */
    grunt.registerTask('deploy', ["build", "copy:deploy"]);
    
}; //end: module.exports
