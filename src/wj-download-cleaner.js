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
  .requiredOption('-d, --download <download>', 'Path to Wabbajack download directory')
  .requiredOption('-l, --lists <lists...>', 'Wabbajack modlist(s) - full path(s) to .wabbajack files')

commander.program.parse();

async function main() {
  const downloadPath = commander.program.opts().download;
  const modlistFilePaths = commander.program.opts().lists;

  logger.info('Loading modlists:\n' + modlistFilePaths.map(fp => `- ${fp}`).join('\n'));

  const modlists = await Promise.all(modlistFilePaths.map(loadModlist));
  const modlistFilenames = new Set([].concat(...modlists.map(ml => ml.Archives.map(a => a.Name.trim().toLowerCase()))));

  logger.info('Loaded');

  logger.info('Searching for unused files...');

  const downloadDirFiles = await fsP.readdir(downloadPath, { withFileTypes: true });
  const downloadedFilenames = downloadDirFiles
    .filter(f => f.isFile() && !f.name.endsWith('.meta'))
    .map(f => f.name);

  const unusedFilenames = downloadedFilenames.filter(fn => !modlistFilenames.has(fn.toLowerCase()));
  
  if (!unusedFilenames.length) {
    logger.info('No unused files found');
    return;
  }

  logger.info(`Found ${unusedFilenames.length} (.meta not counted) unused files`);

  const unusedPath = path.join(downloadPath, 'unused_' + Date.now());
  logger.info(`Moving unused files to ${unusedPath}`);

  await fsP.mkdir(unusedPath);

  for (const fn of unusedFilenames) {
    const source = path.join(downloadPath, fn);
    const sourceMeta = source + '.meta';

    const dest = path.join(unusedPath, fn);
    const destMeta = dest + '.meta';
    
    logger.verbose(fn);

    await Promise.all([
      await fsP.rename(source, dest),
      await fsP.access(sourceMeta).then(() => fsP.rename(sourceMeta, destMeta)),
    ]);
  }
  
  logger.info(`Done. Unused files was moved to ${unusedPath}`);
}

main()
  .catch(e => logger.error(e.stack || e))
  .finally(() => logger.end());
