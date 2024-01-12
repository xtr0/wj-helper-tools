# wj-helper-tools

## wj-list-manual-downloads
Generate a list of files for manual downloads based on a wabbajack file and (optionally) already downloaded files.

1) run script
2) get a .csv file (separator - tab)
3) open .csv with any text editor or with Excel/Google Sheets/etc...
4) ????
5) profit

Output format is `<file name>\t<url>`

_**NOTE:**_ Only file names are used to detect missing files => if file was changed but filename are the same it will be considered as already downloaded

### Usage
#### Standalone version
Download and run an exe file from releases

##### Get list of all external (non-nexus) files
If modlist file is `F:\Wabbajack\3.4.1.0\downloaded_mod_lists\some_@@_mod_list.wabbajack` then run the following:

```
wj-list-manual-downloads F:\Wabbajack\3.4.1.0\downloaded_mod_lists\some_@@_mod_list.wabbajack
```

Result will be in `some_@@_mod_list.wabbajack.csv` (in current folder)

##### Get list of external (non-nexus) files missing in the download
If modlist file is `F:\Wabbajack\3.4.1.0\downloaded_mod_lists\some_@@_mod_list.wabbajack` and a download folder is `G:\WJ.Skyrim`
and you want to get the results in `some_mod_list.csv`
then run the following:

```
wj-list-manual-downloads F:\Wabbajack\3.4.1.0\downloaded_mod_lists\some_@@_mod_list.wabbajack G:\WJ.Skyrim
```

Result will be in `some_@@_mod_list.wabbajack.csv` (in current folder)

#### NodeJS version
1) Install NodeJS
2) Check out this repo
3) Run `npm i`

Run either
```
npm run list-manual-downloads F:\Wabbajack\3.4.1.0\downloaded_mod_lists\some_@@_mod_list.wabbajack
```
or
```
wj-list-manual-downloads F:\Wabbajack\3.4.1.0\downloaded_mod_lists\some_@@_mod_list.wabbajack G:\WJ.Skyrim
```
(see [Standalone](#standalone-version) for parameters explanation)
