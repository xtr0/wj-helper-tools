if (process.argv.length < 3 || process.argv.length > 4) {
  console.error(`Usage: ${process.argv[1]} <wabbajack file> [download dir]`);
  
  return;
}

const fsP = require('fs').promises;
const path = require('path');
const StreamZip = require('node-stream-zip');

const manualDownloadMarkers = ['directurl=', 'manualurl='];

async function main() {
  const downloadPath = process.argv[3];
  console.log('Download path:', downloadPath || 'not specified. All external files will be listed');
  
  const modlistFilePath = process.argv[2];
  console.log('Loading modlist:', modlistFilePath);
  const modlist = await loadModlist(modlistFilePath);

  console.log('Generating file list...');
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
    console.log('No files to download found');
    return;
  }
  
  const csvFilename = path.basename(modlistFilePath) + '.csv';
  console.log('Writing file list:', csvFilename);

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

async function loadModlist(wabbajackFilePath) {
  const wabbajackZip = new StreamZip.async({ file: wabbajackFilePath });
  const modlistData = await wabbajackZip.entryData('modlist');

  await wabbajackZip.close();

  return JSON.parse(modlistData.toString('utf8'));
}

main().catch(console.error);
