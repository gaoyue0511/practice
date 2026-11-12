@echo off
chcp 65001 >nul
set NODE_OPTIONS=--openssl-legacy-provider
node app.js