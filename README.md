# etuan2

## Config
1.Copy client/src/environments/environment.ts and save as client/src/environments/environment.prod.ts, change with your own google map api key and google analitics api key.

2. Creat an empty mysql database, and copy server/datasources.json and save as server/datasources.developement.json.
Change your connection string to the field `url`

## Run

### Run Api Server

cd to etuan2, and run `npm start`, it will prompt: Do you want to reset database? (y/n)
If it is your first time run or you want to reset the database, choose y, otherwise input n.

### Run client
cd to etuan2/client and run `ng serve --port 5004`


### Generate language template
run `ng xi18n --output-path locale` and under the locale folder you will see messages.xlf, use your merge tools merge the differences to messages-zh-Hans.xlf, and add <target> to your new items to be translate.

#### Run client locale version
run `ng serve --port 5004 --configuration=zh-Hans`

#### Build production locale version
run `ng build --prod --i18n-file src/locale/messages.zh-Hans.xlf --i18n-format xlf --i18n-locale zh-Hans`



## Generate Client
https://github.com/mean-expert-official/loopback-sdk-builder/wiki
