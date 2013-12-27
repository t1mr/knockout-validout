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

  grunt.registerTask('test', 'run test in browser', function() {
    grunt.util.spawn({
      cmd: process.argv[0],
      args: ['node_modules/jasmine-node/lib/jasmine-node/cli.js', '--color' ,'spec/knockout-validoutSpec.js'],
      opts: { stdio: 'inherit' }
    }, function (error, result) {
      if (error) {
        console.error('Error: ' + error);
        console.error('Return code: ' + result.code);
      }
      console.log(result.stdout.toString());
      return;
    });
  });
};
