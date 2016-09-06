// TODO:
// use `rabin` module for non-browser implementation https://github.com/mafintosh/hyperdrive/blob/master/archive.js#L6
var chunker = require('choppa')
var pump = require('pump')
var progress = require('progress-stream')
var fileReader = require('filereader-stream')
var path = require('path')
var QueuedFileModel = require('./model.js')
var noop = function () {}

module.exports = HyperdriveImportQueue

function HyperdriveImportQueue (files, archive, options) {
  if (!(this instanceof HyperdriveImportQueue)) {
    return new HyperdriveImportQueue(files, archive, options)
  }

  this.queue = []
  this.archive = archive
  this.cwd = options.cwd || ''
  this.chunkSize = options.chunkSize || 4*1024
  this.progressInterval = options.progressInterval || 100
  this.isWriting = false

  this.onQueueNewFile = options.onQueueNewFile || noop
  this.onFileWriteBegin = options.onFileWriteBegin || noop
  this.onFileWriteComplete = options.onFileWriteComplete || noop
  this.onCompleteAll = options.onCompleteAll || noop

  if (files) this.add(files)
}

HyperdriveImportQueue.prototype.add = function (files, cwd) {
  var self = this
  if (cwd) this.cwd = cwd
  files.forEach(function (file) {
    var queueFile = new QueuedFileModel(file)
    self.queue.push(queueFile)
    self.onQueueNewFile(null, queueFile)
  })
  if (self.queue.length > 0 && !this.isWriting) _addFiles()

  function _addFiles () {
    self.isWriting = true
    var file = self.queue[0]
    var stream = fileReader(file)
    var entry = {
      name: path.join(self.cwd, file.fullPath.slice(1)),
      mtime: Date.now(),
      ctime: Date.now()
    }
    file.progressListener = progress({ length: stream.size, time: self.progressInterval })
    self.onFileWriteBegin(null, file)
    pump(
      stream,
      chunker(self.chunkSize),
      file.progressListener,
      self.archive.createFileWriteStream(entry),
      function (err) {
        if (err) {
          file.writeError = true
          self.onFileWriteComplete(err, file)
        } else {
          file.progress = { complete: true }
          self.onFileWriteComplete(null, file)
        }
        self.queue.splice(0,1)
        if (self.queue.length === 0) {
          self.isWriting = false
          return self.onCompleteAll(null, files)
        } else {
          return _addFiles()
        }
      }
    )
  }
}
