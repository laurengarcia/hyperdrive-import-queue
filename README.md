# hyperdrive-import-queue
Takes an array of files, chunks and writes them to a hyperdrive archive. Returns file objects with a progress listener that emits import progress info as each file is written.

#### TODO: rabin-ify the chunks for non-browser hyperdrive imports.

## Usage
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
