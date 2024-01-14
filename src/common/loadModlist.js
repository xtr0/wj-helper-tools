const StreamZip = require('node-stream-zip');

async function loadModlist(wabbajackFilePath) {
  const wabbajackZip = new StreamZip.async({file: wabbajackFilePath});
  const modlistData = await wabbajackZip.entryData('modlist');

  await wabbajackZip.close();

  return JSON.parse(modlistData.toString('utf8'));
}

module.exports = loadModlist;
