# gulp-notes

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
    header: '# Notes #\n',
    label: '\n## <%= label %> ##\n',
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
/* BILL: Don't use a regular expression here! */
var index = file.search(/bill/);

/* FIXME: This is broken */
var durr = 'Hello +' World;
```

Then we `gulp` and get this beautiful thang.

```markdown
# Notes

## BILL

## FIXME
* Make it neat. - **js/another.js:3**

## NOTES
* New Note why is this not working? - **js/another.js:6**

Generated: **Saturday, March 1st, 2014, 1:20:35 PM**
```

<!-- TODO: Write a better readme and a couple tests. -->