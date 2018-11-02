// A simple server-side script that serves a JSON object.
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3000 });
var fs = require('fs');

// External Data Import {{{1
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

// Template for the protocol container. {{{1
// 'package' property needs to be defines here as might be receiving a raw
// contaner in cases where the data back-end is offline.
var data_container = {
    'message' : null,
    'records': {
        'client_input': false,
        'server_update': false,
        'feed_active': false,
    },
    'flags': {
        'is_first_transmission': true,
    },
    'package' : {
        'fruit': null,
        'price': null,
        'signature': null,
    },
};
// }}}1

// Define Emission Hooks {{{1
var emitter = function() {};

// Define a hook for the emission point.
var emission = function(input) {
    emitter(input);
};
// }}}1

// Intro.
data_container['message'] = 'Greetings from the server.';
// Init the signature variable.
// Our transmission dictionary will become:
//      {'fruit': val, 'price': val, 'signature': val}
// to demonstrate the flow of data from the client to the server.
let signature;

// This needs to be in the message section (onMessage) is still am option as we
// might need to send config from the client. For example, a fruit name.
// console.log('[server:onMessage] received request:', message);
wss.on('connection', function(ws) {
    /*-----------------------------------------------------------------;
    ; This section runs only on a 'message receive from client' event. ;
    ;-----------------------------------------------------------------*/

    ws.on('message', function(message) {
        // TODO: We can implement an additiona emission hook entry here so that
        // we can have clien messages and data stream.

        console.log('[server:onConnection:onMessage] received request:', message);
        // Handle the requests from the client.
        // Inject the request message into the signature.
        signature = message;

        // First update the JSON object by adding the signature component.
        // Guard against undefined signatures.
        if(signature === undefined){
            signature = 'None';
        }
        // The 'input' argument is the pure object that has been imported
        // through the data stream. We are adding the extra 'signature' field
        // here.
        data_container.package['signature'] = signature;

        // Update the communication record to indicate that the client has sent
        // the server some information.
        data_container.records['client_input'] = true;
        data_container.flags['is_first_transmission'] = false;

        // No need to interfere with the rest 'package' section of the
        // container.

        // Sending the payload to all clients.
        wss.clients.forEach(function(client) {
            // Prepare for transmission.
            let transmission = JSON.stringify(data_container);

            // Debug
            console.log('[server:onConnection:onMessage] Sending:\n', transmission);
            //
            // Send the transmission.
            client.send(transmission);
        });
    });

    /*---------------------------------------;
    ; This section runs only on data update. ;
    ;---------------------------------------*/
    // Plugin the emission hook.
    emitter = function(input) {
        // Debug the input data stream.
        console.log('INPUT_STREAM:', input);

        // First update the JSON object by adding the signature component.
        // Guard against undefined signatures.
        if(signature === undefined){
            signature = 'None';
        }
        // The 'input' argument is the pure object that has been imported
        // through the data stream. We are adding the extra 'signature' field
        // here.
        input['signature'] = signature;

        // Then update carrier.
        data_container.records['server_update'] = true;
        data_container.records['client_input'] = false;
        data_container.records['feed_active'] = true;
        data_container.flags['is_first_transmission'] = false;
        data_container['package']  = input;

        // Sending the payload to all clients.
        wss.clients.forEach(function(client) {
            // Prepare for transmission.
            let transmission = JSON.stringify(data_container);

            // Debug
            console.log('[server:onConnection:onUpdate] Sending:\n', transmission);
            //
            // Send the transmission.
            client.send(transmission);
            // Reser flag.
            data_container.records['server_update'] = false;
        });
    };

    /*-------------------------------------------------;
    ; This section runs only once at first connection. ;
    ;-------------------------------------------------*/
    // Complete the connection by sending the payload to all clients.
    wss.clients.forEach(function(client) {
        // Prepare for transmission.
        let transmission = JSON.stringify(data_container);

        // Debug
        console.log('[server:onConnection:init] Sending:\n', transmission);
        //
        // Send the transmission.
        client.send(transmission);
    });
});

// vim: fdm=marker ts=4
