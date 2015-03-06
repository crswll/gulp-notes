/* global it */

'use strict';

var assert = require('assert');
var path = require('path');
var gulp = require('gulp');

var notes = require('..');

it('Should be a function', function () {
  assert.strictEqual(typeof notes, 'function');
});

it('Should create the `notes.md` file', function (done) {
  var files = [];

  gulp.src([
    path.join(__dirname, 'fixture', 'fixture.js'),
    path.join(__dirname, 'fixture', 'fixture2.js')
  ])

  .pipe(notes())

  .on('data', function (data) {
    files.push(data);
  })

  .on('end', function () {
    assert.strictEqual(files.length, 1);
    assert.strictEqual(files[0].relative, 'notes.md');

    done();
  });
});

it('`notes.md` file should get generated correctly', function (done) {
  var files = [];

  gulp.src([
    path.join(__dirname, 'fixture', 'fixture.js'),
    path.join(__dirname, 'fixture', 'fixture2.js')
  ])
  .pipe(notes())
  .on('data', function (data) {
    files.push(data);
  })

  .on('end', function () {
    var contents = files[0].contents.toString();

    assert.strictEqual(contents.split('\n')[0], '# Notes', 'Should have a header');
    assert.strictEqual(contents.split('\n')[2], '## TODO');
    assert.strictEqual(contents.split('\n')[3], '* Write more tests - **fixture.js:1**');
    assert.strictEqual(contents.split('\n')[8], '## ARTHUR');
    assert.strictEqual(contents.split('\n')[9], '* Do this - **fixture.js:3**');

    assert(/Generated: \*\*.+\*\*/.exec(contents.split('\n').pop()),
      'notes.md should have the date which is generated upon');

    done();
  });
});

it('Should detect all styles of comments', function (done) {
  var files = [];

  gulp.src([
    path.join(__dirname, 'fixture', 'commentStyles.txt')
  ])
  .pipe(notes())
  .on('data', function (data) {
    files.push(data);
  })

  .on('end', function () {
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
  var files = [];

  gulp.src([
    path.join(__dirname, 'fixture', 'empty.js')
  ])
  .pipe(notes())
  .on('data', function (data) {
    files.push(data);
  })

  .on('end', function () {
    var contents = files[0].contents.toString();
    assert.notEqual(contents.indexOf('You have literally nothing to do.'), -1);
    done();
  });
});