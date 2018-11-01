// A simple server-side script that serves a JSON object.
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3000 });
var fs = require('fs');

let obj;

// External Data Source Import {{{1
fs.watch('./data/object.json', (eventType, filename) => {
    console.log(`event type is: ${eventType}`);
    if (`${eventType}` === 'change'){
        fs.readFile('./data/object.json', 'utf8', function (err, data) {
            try {
                if (err) throw err;
                obj = JSON.parse(data);
            } catch(e) {
                // This is critical: When the JSON object is being dumped in
                // real-time, a read of an incomplete file will break the data
                // stream. We should handle incomplete data here.
                obj = { 'error': 'STREAM_BROKEN' };
            }

            // This might a potential solution to solve any time-stamp
            // discrepancies where the gap between the data write time and data
            // read time is too big.
            // obj.dataReadTime = new Date();
            // obj.delayBetweenWriteRead = obj.dataReadTime.getTime() - obj.dataInsertTime.getTime()
            console.log(obj);
            emission()
        });
    }

    if (filename) {
        console.log(`filename provided: ${filename}`);
    } else {
        console.log('filename not provided');
    }
});
// }}}1

// Container for the protocol.
var data_container = {
    'message' : null,
    'data' : null,
};

// Define data emission point.
var emitter = function() {};

// Define a hook for the emission point.
var emission = function(data) {
    emitter(data);
};

// This needs to be in the message section (onMessage) is still am option as we
// might need to send config from the client. For example, a fruit name.
// console.log('[server:onMessage] received request:', message);

wss.on('connection', function(ws) {
    // Plugin the emission hook.
    emitter = function(data) {
        wss.clients.forEach(function(client) {
            let message = 'none'
            // First update the JSON object by adding the message component.
            obj['feedback'] = message;
            console.log('--->', obj);
            // Then update carrier.
            data_container['data']  = obj;
            data_container['message'] = message;

            // Prepare for transmission.
            var transmission = JSON.stringify(data_container);

            // Send the transmission.
            console.log('[server:onConnect] Sending:', transmission);
            client.send(transmission);
        });
    };

    // Update carrier.
    data_container['message'] = 'Welcome to our data stream.';
    data_container['data'] = null;

    // Prepare for transmission.
    var transmission = JSON.stringify(data_container);
    console.log('[server:onConnection] Sending:', transmission);

    // Send carrier.
    ws.send(transmission);

    ws.on('message', function(message) {
        // Debug
        console.log('[server:onMessage] received request:', message);
    });
});

// vim: fdm=marker ts=4
