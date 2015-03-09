# gulp-notes [![Build Status](https://travis-ci.org/crswll/gulp-notes.svg?branch=master)](https://travis-ci.org/crswll/gulp-notes)

Quickly scan your files for specially formatted comments and dump them to a file.


## Options

```javascript
{
  fileName: 'notes.md',
  formats: [
    ['/*', '*/'],
    ['//', '\n'],
    ['<!--', '-->']
  ],
  templates: {
    header: '# Notes\n',
    label: '\n## <%= label %>\n',
    note: '* <%= note %> - <%= fileName %>:<%= lineNumber %>\n',
    empty: '\nYou have literally nothing to do.\n',
    footer: '\nGenerated: **<%= dateCreated %>**'
  }
}
```


## How Do I Use It?

```javascript
var gulp = require('gulp'),
    notes= require('gulp-notes');

gulp.task('notes', function() {
  return gulp.src(paths.scripts)
    .pipe(notes()))
    .pipe(gulp.dest('./'));
});
```


## Quick Example

```javascript
/* BILL: Don't use a regular expression here, .indexOf is plenty idiot! */
var index = file.search(/bill/);

/* FIXME: Extra plus dumb dumb */
var durr = 'Hello +' + World;

// TODO: Make some useful examples.
var example = true;
```

Then we `gulp` and get this beautiful thang.

```markdown
# Notes

## BILL
Don't use a regular expression here, .indexOf is plenty idiot! - **js/file.js:1**

## FIXME
* This is broken - **js/file.js:4**

## TODO
* Make some useful examples. - **js/file.js:7**

Generated: **Saturday, March 1st, 2014, 1:20:35 PM**
```

<!-- TODO: Write a better readme and a couple tests. -->
