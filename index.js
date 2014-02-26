'use strict';

var through = require('through');
var gutil = require('gulp-util');
var _ = require('lodash');

function Notes ( fileName, options ) {

  var collection = [],
      firstFile = null,
      formats = [
        ['/*', '*/'],
        ['//', '\n'],
        ['<!--', '-->']
      ],
      templates = {
        header: '# Notes #\n',
        footer: '\nGenerated: **<%= dateCreated %>**',
        label: '\n## <%= label %> ##\n',
        note: '* <%= note %> - <%= fileName %>:<%= lineNumber %>\n'
      };

  function read ( fileObject ) {

    if( fileObject.isNull() || fileObject.isStream() ) return false;

    if (!firstFile) firstFile = fileObject;

    var file = fileObject.contents.toString('utf8');

    _.each(formats, function (format) {

      var lastIndex = 0,
          open = format[0],
          close = format[1],
          openIndex = file.indexOf(open), 
          closeIndex = file.indexOf(close, openIndex);

      while ( openIndex > -1 && closeIndex > -1 ) {

        var comment = file.slice(openIndex + open.length, closeIndex),
            data = comment.split(':');

        if ( data.length === 2 && data[0].toUpperCase() === data[0] ) {

          var label = data[0].trim(),
              note = data[1].trim().replace(/\s{2,}|\n/g, ' '),
              lineNumber = file.slice(0, openIndex).split('\n').length;

          collection.push({
            label: label,
            note: note,
            lineNumber: lineNumber,
            fileName: fileObject.relative
          });

        }

        lastIndex = openIndex;
        openIndex = file.indexOf(open, lastIndex + 1);
        closeIndex = file.indexOf(close, openIndex);

      }

    });

  };

  function write () {

    if ( collection.length === 0 ) return this.emit('end');

    var labelTemplate = _.template( templates.label ),
        noteTemplate = _.template( templates.note ),
        output = [],
        groupedCollection = _.groupBy( collection, 'label' );

    output.push( _.template(templates.header, {}) );

    _.each(groupedCollection, function(notes, label) {

      output.push(labelTemplate({
        label: label
      }));

      var sortedNotes = _.sortBy(notes, function(note) {
        return note.fileName + ':' + ( '000000' + note.lineNumber ).slice(-6);
      });

      _.each(sortedNotes, function(note) {
        output.push(noteTemplate(note));
      });

    });

    output.push( _.template(templates.footer, { dateCreated: gutil.date("dddd, mmmm dS, yyyy, h:MM:ss TT") }) );

    output = output.join('').replace('\n', gutil.linefeed);

    var notesFile = new gutil.File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: firstFile.base + fileName,
      contents: new Buffer(output)
    });

    this.emit('data', notesFile);
    this.emit('end');

  }

  return through(read, write);

}

module.exports = Notes;