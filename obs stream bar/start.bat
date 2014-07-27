@echo off
echo Checking for dependencies!
echo -npm-----------------
call npm install
echo starting node
echo -app.js--------------
node app.js
ping -n 50 -w 1000 127.0.0.1 > nul