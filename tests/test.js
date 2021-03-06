/* global it */

'use strict';

var assert = require('assert');
var path = require('path');
var gulp = require('gulp');

var notes = require('..');

function run (files, options, tests) {
  var returned = [];

  gulp.src(files.map(function (fileName) {
    return path.join(__dirname, 'fixture', fileName);
  }))
    .pipe(notes(options))
    .on('data', function (file) {
      returned.push(file);
    })
    .on('end', function () {
      tests(returned);
    });
}

it('Should be a function', function () {
  assert.strictEqual(typeof notes, 'function');
});

it('Should create the `notes.md` file', function (done) {
  run([
    'fixture.js',
    'fixture2.js'
  ], {}, function (files) {
    assert.strictEqual(files.length, 1);
    assert.strictEqual(files[0].relative, 'notes.md');

    done();
  });
});

it('`notes.md` file should get generated correctly', function (done) {
  run([
    'fixture.js',
    'fixture2.js'
  ], {}, function (files) {
    var contents = files[0].contents.toString();
    var lines = contents.split('\n');

    assert.strictEqual(lines[0], '# Notes', 'Should have a header');
    assert.strictEqual(lines[2], '## TODO');
    assert.strictEqual(lines[3], '* Write more tests - **fixture.js:1**');
    assert.strictEqual(lines[8], '## ARTHUR');
    assert.strictEqual(lines[9], '* Do this - **fixture.js:3**');

    assert(/Generated: \*\*.+\*\*/.exec(lines.pop()),
      'notes.md should have the date which is generated upon');

    done();
  });
});

it('Should detect all styles of comments', function (done) {
  run(['commentStyles.txt'], {}, function (files) {
    var contents = files[0].contents.toString();

    assert.notEqual(contents.indexOf('* Number 1 - **commentStyles.txt:1**'), -1,
      'Should detect single-line javascript-style comments');

    assert.notEqual(contents.indexOf('* Number 2 - **commentStyles.txt:2**'), -1,
      'Should detect multi-line javascript-style comments');

    assert.notEqual(contents.indexOf('* Number 3 - **commentStyles.txt:3**'), -1,
      'Should detect html-style comments');

    done();
  });
});

it('`notes.md` should contain a message when no items were found', function (done) {
  run(['empty.js'], {}, function (files) {
    var contents = files[0].contents.toString();
    assert.notEqual(contents.indexOf('You have literally nothing to do.'), -1);

    done();
  });
});

it('Should combine line breaks into one line', function (done) {
  run(['multiline.js'], {}, function (files) {
    var contents = files[0].contents.toString();
    assert.notEqual(contents.indexOf('Let\'s see what happens with multiple lines. Boogie woogie.'), -1);

    done();
  });
});

it('The `fileName` option should enable you to customize the file name', function (done) {
  run(['fixture.js'], {
    fileName: 'custom.md'
  }, function (files) {
    assert.strictEqual(path.basename(files[0].path), 'custom.md');

    done();
  });
});

it('The `formats` option should allow you to add different comment syntaxes.', function (done) {
  run(['format.hs'], {
    formats: ['{-', '-}']
  }, function (files) {
    var contents = files[0].contents.toString();
    assert.notEqual(contents.indexOf('## WOW'), -1);
    assert.notEqual(contents.indexOf('This is the most haskell I\'ve ever written.'), -1);

    done();
  });
});
