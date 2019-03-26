# Duocun

Duocun is a food delivery website

# Dependencies

Nodejs 
Mongodb

# Install

git clone project

cd to project root folder /, (remove package-lock.json), then run `npm install` for server

cd to /client folder, (remove package-lock.json), then run `npm install` for client


## Config
copy duocun.cfg.json file to the parent folder of root /

## Run

### Run Server

cd to project root folder /,  and run `npm run build`

then `npm run start` or open Visual Studio Code and hit Debug menu.

### Run client

cd to /client and run `ng serve --port 5004 --configuration=zh-Hans`


### Generate language template
run `ng xi18n --output-path locale` and under the locale folder you will see messages.xlf, use your merge tools merge the differences to messages-zh-Hans.xlf, and add <target> to your new items to be translate.

#### Run client locale version
run `ng serve --port 5004 --configuration=zh-Hans`

#### Build production locale version
run `ng build --prod --i18n-file src/locale/messages.zh-Hans.xlf --i18n-format xlf --i18n-locale zh-Hans`


