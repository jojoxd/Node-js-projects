## Open Broadcaster Software - Stream bar

on run, npm install will be called so you have all module updates

this node.js server will make a bar on a html page, which you can load with [CLR browser plugin](https://obsproject.com/forum/resources/clr-browser-source-plugin.22/)  

get Node.js [here](http://nodejs.org)!

## usage

just double-click run.bat to start the server

the server will listen to port 81, but you can change it in the settings @ [app.js](./app.js)

### layout

to change the layout, change the clientSettings @ [app.js](./app.js)

howto: 
```
"[1/3|1/6]-[followers|announcements|vlc|spacer],andAgain,andAgain,...";
```



screenshot: 

![image](http://i.imgur.com/bfzTB0C.png "screenshot")