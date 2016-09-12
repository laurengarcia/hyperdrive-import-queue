module.exports = QueuedFileModel

function QueuedFileModel (file) {
  if (!file) return new Error('[QueuedFileModel] file is undefined')
  this.file = file

  // additional properties we'll need:
  this.file.progress = null
  this.file.progressListener = null
  this.file.progressHandler = null
  this.file.importError = false

  if (!this._validateProps()) {
    throw new Error('[QueuedFileModel] file is missing one or more properties')
  } else {
    return this.file
  }
}

QueuedFileModel.prototype._validateProps = function () {
  if (!this.file.fullPath) return false
  if (!isFinite(this.file.size) || this.file.size < 0) return false
  return true
}
