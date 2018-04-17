module.exports = function (grunt) {

    // Display the elapsed execution time of grunt tasks
    require('time-grunt')(grunt);
    // Load all grunt-* packages from package.json
    require('load-grunt-tasks')(grunt);

    // Project configuration
    grunt.initConfig({
          concat: {
                options: {
                  separator: '\n', //add a new line after each file
                  stripBanners: true
                },
                dist: {
            			// the files to concatenate
            			src: [
            				'<%= spin_libs %>spin.min.js',    // include spinner libs
            				'<%= spin_libs %>ladda.min.js',   // include spinner libs
                    '<%= js_min_dest %>'              // add minified JS FE
            			],
            			dest: '<%= js_bundle %>' // the location of the resulting JS file
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
                  '<%= js_src %>es_render.js',       // es_render.js 'http://beeroteka/beers/search'
                  '<%= js_src %>mongo_render.js',    // mongo_render.js http://beeroteka/beers/search2
                  '<%= js_src %>graphics.js'         // graphics.js http://beeroteka/beers/graphics
                ],
                dest: '<%= js_min_dest %>'
            }
        },
        // Task template properties.
        js_src:      'public/js/',
        dest:        '<%= js_src %>bundle/render.',
        js_min_dest: '<%= dest %>min.js',             // 'public/js/bundle/render.min.js'
        js_bundle:   '<%= dest %>bundle.min.js',      // 'public/js/bundle/render.bundle.min.js'
        spin_libs:   'public/ladda-bootstrap/dist/'
    });

    // Loading Grunt plugins and tasks
    grunt.registerTask('default', function (concat) {
        grunt.task.run('uglify');
        grunt.task.run('concat');
    });
};
