@echo off

if "%~1" == "" goto usage

if not exist tmp mkdir tmp

del dist\%1* /q >nul
del tmp\%1* /q >nul

call node_modules\.bin\browserify.cmd src\%1.js -o tmp\%1-bundle.js --node --external process
echo { "main": "tmp/%1-bundle.js", "output": "tmp/%1-sea-prep.blob", "disableExperimentalSEAWarning": true } > tmp\%1-sea-config.json

node -e "require('fs').copyFileSync(process.execPath, 'dist/%1%.exe')"
node --experimental-sea-config tmp\%1-sea-config.json 
npx postject dist\%1.exe NODE_SEA_BLOB tmp\%1-sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

del tmp\%1* /q >nul

goto :eof

:usage
echo Usage: %0 ^<main file without ext^>
