var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test', 'run test in browser', function(type, spec) {
    var target = spec === undefined ? 'spec' : ('spec/knockout-validout-' + spec + '-spec.js');
    var console_test = grunt.util.spawn.bind(grunt.util, {
      cmd: process.argv[0],
      args: ['node_modules/jasmine-node/lib/jasmine-node/cli.js', '--color', '--matchall', '--verbose' , target],
      opts: { stdio: 'inherit' }
    }, function (error, result) {
      if (error) {
        console.error('Error: ' + error);
        console.error('Return code: ' + result.code);
      }
    });
    var browser_test = grunt.util.spawn.bind(grunt.util, {
      cmd: 'xdg-open',
      args: [path.join(__dirname, 'jasmine-standalone/SpecRunner.html')],
    }, function (error, result) {
      if (error) {
        console.error('Error: ' + error);
        console.error('Return code: ' + result.code);
      }
    });

    switch (type) {
      case 'browser':
        browser_test();
        break;
      default:
        console_test();
    }
  });
};
