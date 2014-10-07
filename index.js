'use strict';

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8080})
  , usage = require('usage');

var pid = (process.argv[2])? parseInt(process.argv[2]): process.pid;
console.log(pid);

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

var allPoints = [],
    maxPoints = 300,
    options =  { keepHistory: true };

setInterval(function() {
    usage.lookup(pid, options, function(err, stat) {

            allPoints.push(stat.cpu);
            if(allPoints.length > maxPoints){
                allPoints.shift();
            }
            var res = [];
            var maxVal = 0;
            for (var i = 0; i < allPoints.length; ++i) {
                res.push([i, allPoints[i]]);
                maxVal = allPoints[i] > maxVal ? allPoints[i] : maxVal;
            }
            var ysize = maxVal * 2;
            if(ysize  > 100){
                ysize = 100;
            }
            var result = {'data':res,'yaxis':ysize};
            //console.log(JSON.stringify(stat.cpu));
            wss.broadcast(JSON.stringify(result));
    });
}, 200);