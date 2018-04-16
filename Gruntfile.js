module.exports = function (grunt) {

    // Display the elapsed execution time of grunt tasks
    require('time-grunt')(grunt);
    // Load all grunt-* packages from package.json
    require('load-grunt-tasks')(grunt);

    // Project configuration
    grunt.initConfig({
          concat: {
            js: {
                options: {
                  separator: '\n'  //add a new line after each file
                },
                dist: {
            			// the files to concatenate
            			src: [
            				//include spinner libs
            				'public/ladda-bootstrap/dist/spin.min.js',
            				'public/ladda-bootstrap/dist/ladda.min.js'
            			],
                  // the location of the resulting JS file
            			dest: 'public/js/bundle/spinner.js'
            	}
          }
        },
        uglify: {
            options: {
                compress: true,
                mangle: true,
                sourceMap: false
            },
            target: {
                src: [
                  'public/js/es_render.js',       // es_render.js 'http://beeroteka/beers/search'
                  'public/js/mongo_render.js',    // mongo_render.js http://beeroteka/beers/search2
                  'public/js/graphics.js'         // graphics.js http://beeroteka/beers/graphics
                ],
                dest: 'public/js/bundle/render.min.js'
            }
        }
    });

    // Loading Grunt plugins and tasks
    grunt.registerTask('default', function (concat) {
        // var dest = grunt.config('concat.js.dist.dest');
        // grunt.config('concat.js.dist.src', dest);
        // grunt.task.run('concat');
        grunt.task.run('uglify');
    });
};
