'use strict';

var through = require('through'),
    gutil = require('gulp-util'),
    _ = require('lodash');

function Notes (options) {

  var
    PLUGIN_NAME = 'gulp-notes',
    settings = {
      fileName: 'notes.md',
      formats: [
        ['/*', '*/'],
        ['//', '\n'],
        ['<!--', '-->']
      ],
      templates: {
        header: '# Notes\n',
        label: '\n## <%= label %>\n',
        note: '* <%= note %> - **<%= fileName %>:<%= lineNumber %>**\n',
        empty: '\nYou have literally nothing to do.\n',
        footer: '\nGenerated: **<%= dateCreated %>**'
      }
    };

  if (options) {

    var error = false;

    if (_.isObject(options)) {
      if (options.fileName) {
        if (_.isString(options.fileName)) {
          settings.fileName = options.fileName;
        } else {
          error = 'The fileName option has to be a string....';
        }
      }
      if (options.templates) {
        if (_.isObject(options.templates)) {
          settings.templates = _.extend(settings.templates, options.templates);
        } else {
          error = 'The templates option has to be an object...';
        }
      }
      if (options.formats) {
        if (_.isArray(options.formats)) {
          settings.formats.push.apply(settings.formats, options.formats);
        } else {
          error = 'The formats option has to be an array...';
        }
      }
    } else {
      error = 'The options have to be an object...';
    }

    if (error) throw new gutil.PluginError(PLUGIN_NAME, error);

  }

  var firstFile = null,
      collection = [],
      fileName = settings.fileName,
      formats = settings.formats,
      templates = settings.templates;

  function read (fileObject) {

    if(fileObject.isNull() || fileObject.isStream()) return false;

    if (!firstFile) firstFile = fileObject;

    var file = fileObject.contents.toString('utf8'),
        fileType = fileObject.relative.split('.').pop();

    _.each(formats, function (format) {

      var lastIndex = 0,
          open = format[0],
          close = format[1],
          openIndex = file.indexOf(open), 
          closeIndex = file.indexOf(close, openIndex);

      while (openIndex > -1 && closeIndex > -1 ) {

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

    var labelTemplate = _.template(templates.label),
        noteTemplate = _.template(templates.note),
        output = [];

    output.push(_.template(templates.header, {}));

    if (collection.length) {

      var groupedCollection = _.groupBy(collection, 'label');

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

    } else {
      output.push(_.template(templates.empty, {}));
    }

    output.push(_.template(templates.footer, { 
      dateCreated: gutil.date("dddd, mmmm dS, yyyy, h:MM:ss TT") 
    }));

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