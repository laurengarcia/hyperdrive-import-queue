// TODO:
// use `rabin` module for non-browser implementation https://github.com/mafintosh/hyperdrive/blob/master/archive.js#L6
var choppa = require('choppa')
var pump = require('pump')
var progress = require('progress-stream')
var fileReader = require('filereader-stream')
var path = require('path')
var encoding = require('dat-encoding')

var QueuedFileModel = require('./model.js')

function HyperdriveWriteQueue (files, archive, options) {
  if (!(this instanceof HyperdriveWriteQueue)) return new HyperdriveWriteQueue(files, archive, options)

  var chunkSize = options.chunkSize || 4*1024
  var progressInterval = options.progressInterval || 100
  var onQueueNewFile = options.onQueueNewFile || null
  var onFileWriteBegin = options.onFileWriteBegin || null
  var onFileWriteComplete = options.onFileWriteComplete || null
  var onCompleteAll = options.onCompleteAll || null

  files.forEach(function (file) {
    var _file = new QueuedFileModel(file)
    onQueueNewFile(file)
  })
  var i = 0
  loop()

  function loop () {
    if (i === files.length) {
      return console.log('added files to ', encoding.encode(archive.key), files)
      onCompleteAll(null)
    }
    var file = files[i++]
    var stream = fileReader(file)
    var entry = {
      name: path.join(cwd, file.fullPath),
      mtime: Date.now(),
      ctime: Date.now()
    }
    file.progressListener = progress({ length: stream.size, time: progressInterval })
    onFileWriteBegin(null, file)
    pump(
      stream,
      choppa(chunkSize),
      archive.createFileWriteStream(entry),
      function (err) {
        if (err) {
          file.writeError = true
          onFileWriteComplete(err, file)
        } else {
          file.progress = { complete: true }
          onFileWriteComplete(null, file)
        }
        loop()
      }
    )
  }

}
