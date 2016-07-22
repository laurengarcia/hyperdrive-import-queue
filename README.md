# hyperdrive-import-queue
Takes an array of files, chunks and writes them to a [hyperdrive archive](https://github.com/mafintosh/hyperdrive). `onFileWriteBegin` callback returns each file object with a progress listener that emits file write progress info as each file is written. Progress info provided via [progress-stream](https://www.npmjs.com/package/progress-stream).

#### TODO: rabin-ify the chunks for non-browser hyperdrive imports.

## Usage
arguments:
@files: array of files to import/write to archive
@archive: hyperdrive archive
@options: object -- see below
```
hyperdriveImportQueue(files, archive, {
  cwd: '',
  progressInterval: 100,
  chunkSize: 4*1024,
  onQueueNewFile: function (err, file) {
    // add file to your queue UI
  },
  onFileWriteBegin: function (err, file) {
    // you may now start incrementing your progress bar UI at this point
    // by attaching your progress listener callback to the `progress` event:
    // file.progressListener.on('progress', function (progress) {
        // increment your progress bars here
    // })
  },
  onFileWriteComplete: function (err, file) {
    // file is now written to hyperdrive archive
  },
  onCompleteAll: function () {
    // whatevs
  }
})
```
