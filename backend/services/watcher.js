const chokidar = require('chokidar');
const path = require('path');
const { processFile } = require('./organizer');

const WATCH_DIR = path.resolve(__dirname, '../../watch');

const startWatcher = () => {
    console.log(`Starting Watcher Service on: ${WATCH_DIR}`);

    const watcher = chokidar.watch(WATCH_DIR, {
        persistent: true,
        ignoreInitial: true, // Don't process existing files on startup for now
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    watcher
        .on('add', (filePath) => {
            console.log(`File detected: ${filePath}`);
            processFile(filePath);
        })
        .on('error', (error) => console.log(`Watcher error: ${error}`));
};

module.exports = { startWatcher };
