const { promises: fsP } = require('fs');
const path = require('path');
const commander = require('commander');

const loadModlist = require('./common/loadModlist');
const logger = require('./common/logger');

const programFilename = path.basename(process.argv[1]);

commander
  .program
  .name(programFilename)
  .showHelpAfterError()
  .option('-d, --download <download>', 'Path to Wabbajack download directory')
  .requiredOption('-l, --list <list>', 'Wabbajack modlist - full path to .wabbajack file')

commander.program.parse();

const manualDownloadMarkers = ['directurl=', 'manualurl='];

async function main() {
  const downloadPath = commander.program.opts().download;
  const listAllFiles = !downloadPath;
  logger.info(`Download path: ${downloadPath || 'not specified. All external files will be listed'}`);
  
  const modlistFilePath = commander.program.opts().list;
  logger.info(`Loading modlist: ${modlistFilePath}`);
  const modlist = await loadModlist(modlistFilePath);

  logger.info('Generating file list...');
  const manualDownloadArchives = modlist.Archives
    .filter(a => manualDownloadMarkers.some(m => a.Meta.toLowerCase().includes(m)))
    .reduce((af, a) => { af[a.Name.trim()] = a.Meta; return af; }, {});

  const downloadDirFiles = (downloadPath && await fsP.readdir(downloadPath, { withFileTypes: true })) || [];
  const downloadedFilenames = downloadDirFiles
    .filter(f => f.isFile() && !f.name.endsWith('.meta'))
    .map(f => f.name.toLowerCase());

  const lines = [];

  for (const [name, meta] of Object.entries(manualDownloadArchives)) {
    if (!downloadedFilenames.includes(name.toLowerCase())) {
      lines.push(`${name}\t${getUrlFromMetaIfPossible(meta)}`);
    }
  }
  
  if (!lines.length) {
    logger.info('No files to download found');
    return;
  }
  
  const csvFilename = `${path.basename(modlistFilePath)}_${listAllFiles ? 'all' : 'new'}.csv`;
  logger.info(`Writing file list: ${csvFilename}`);

  await fsP.writeFile(csvFilename, lines.join(`\n`));
}

function getUrlFromMetaIfPossible(meta) {
  const urlLine = meta.replaceAll('\r', '\n').split('\n').find(isUrlLine);

  return urlLine
    ? urlLine.substring(urlLine.indexOf('=') + 1)
    : meta.replaceAll('\n', ' ');

  function isUrlLine(line) {
    const l = line.trim().toLowerCase();

    return l.startsWith('directurl=') || l.startsWith('manualurl=');
  }
}

main()
  .catch(e => logger.error(e.stack || e))
  .finally(() => logger.end());
