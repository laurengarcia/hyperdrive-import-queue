// TODO:
// use `rabin` module for non-browser implementation https://github.com/mafintosh/hyperdrive/blob/master/archive.js#L6
var chunker = require('choppa')
var pump = require('pump')
var progress = require('progress-stream')
var fileReader = require('filereader-stream')
var path = require('path')
var encoding = require('dat-encoding')
var QueuedFileModel = require('./model.js')

module.exports = HyperdriveImportQueue

function HyperdriveImportQueue (files, archive, options) {
  if (!(this instanceof HyperdriveImportQueue)) return new HyperdriveImportQueue(files, archive, options)

  var cwd = options.cwd || ''
  var chunkSize = options.chunkSize || 4*1024
  var progressInterval = options.progressInterval || 100
  var onQueueNewFile = options.onQueueNewFile || null
  var onFileWriteBegin = options.onFileWriteBegin || null
  var onFileWriteComplete = options.onFileWriteComplete || null
  var onCompleteAll = options.onCompleteAll || null

  files.forEach(function (file) {
    var fileModel = new QueuedFileModel(file)
    onQueueNewFile(null, fileModel)
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
      chunker(chunkSize),
      file.progressListener,
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
