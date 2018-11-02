// A simple server-side script that serves a JSON object.
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3000 });
var fs = require('fs');

// let obj;

// External Data Source Import {{{1
fs.watch('./data/object.json', (eventType, filename) => {
    console.log(`event type is: ${eventType}`);
    if (`${eventType}` === 'change'){
        fs.readFile('./data/object.json', 'utf8', function (err, data) {
            let obj = {};
            try {
                if (err) throw err;
                obj = JSON.parse(data);
            } catch(e) {
                // This is critical: When the JSON object is being dumped n
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
            emission(obj);
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
    'package' : null,
};

// Define data emission point.
var emitter = function() {};

// Define a hook for the emission point.
var emission = function(input) {
    emitter(input);
};

// This needs to be in the message section (onMessage) is still am option as we
// might need to send config from the client. For example, a fruit name.
// console.log('[server:onMessage] received request:', message);

wss.on('connection', function(ws) {
    // Intro.
    data_container['message'] = 'connected';
    data_container['package'] = null;

    // Plugin the emission hook.
    let signature;

    // onConnection: ACTIVE
    emitter = function(input) {
        wss.clients.forEach(function(client) {
            // let message = 'none'
            // First update the JSON object by adding the message component.
            if(signature === undefined){
                signature = 'None';
            }
            input['signature'] = signature;
            console.log('INPUT_STREAM:', input);

            // Then update carrier.
            data_container['message'] = 'server_reply';
            data_container['package']  = input;

            // Prepare for transmission.
            let transmission = JSON.stringify(data_container);

            // Debug
            console.log('[server:onConnection:active] Sending:\n', transmission);

            // Send the transmission.
            client.send(transmission);
        });
    };

    // Handle requests from the client.
    ws.on('message', function(message) {
        console.log('[server:onMessage] received request:', message);
        wss.clients.forEach(function(client) {
            data_container['message'] = 'client_input';
            signature = message;

            // Prepare for transmission.
            let transmission = JSON.stringify(data_container);

            // Debug
            console.log('[server:onMessage] Sending:', transmission);

            // Send the transmission.
            client.send(transmission);
        })
    });

    // onConnection: PASIVE
    // This only runs on the initial connection
    // Prepare for transmission.
    let transmission = JSON.stringify(data_container);

    // Debug
    console.log('[server:onConnection:passive] Sending:', transmission);

    // Send the transmission.
    ws.send(transmission);
});

// vim: fdm=marker ts=4
