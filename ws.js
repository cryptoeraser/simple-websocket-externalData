// A simple server-side script that serves a JSON object.
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3000 });
var fs = require('fs');

// Globals
var DATA_FEED_IS_ACTIVE = false;
var CHANGING = false;
var TIMER = null;
var DATA_CHECK_TIMER = null;

// Function to handle data feed check.{{{1
function checkChanging() {
    if (!CHANGING) {
        clearInterval(TIMER);
        TIMER = null;
        // notifyNoChange();
        // Reset the data-feed flag.
        DATA_FEED_IS_ACTIVE = false;
        passiveEmission();
    }
    CHANGING = false;
}
// }}}1

// The 'External Data Loop' and the 'Data Feed Loop' are the two primary
// driving forces here. Once the external data source is interrupted, in this
// case the file update process stops, we still need to be able to push our
// data container to the client. This is possible through the Data Feed Loop.
// External Data Loop {{{1
// Watch Loop: Works only when there is a change in the watched file.
fs.watch('./data/object.json', (eventType, filename) => {
    // console.log('event type is:', eventType);
    if (eventType === 'change'){
        fs.readFile('./data/object.json', 'utf8', function (err, data) {
            if (!TIMER ) {
                TIMER = setInterval(checkChanging, 1000);
            }
            DATA_FEED_IS_ACTIVE = true;
            CHANGING = true;

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
            // *** We need to call the hook inside the websocket block. ***
            activeEmission(obj);
        });
    }
});
// }}}1

// Data Feed Loop {{{1
if(!DATA_FEED_IS_ACTIVE){
    DATA_CHECK_TIMER = setInterval( function() {
        console.log('DATA_FEED_IS_ACTIVE:', DATA_FEED_IS_ACTIVE);
        // *** We need to call the hook inside the websocket block. ***
        passiveEmission();
    }, 1000);
} else {
    clearInterval(DATA_CHECK_TIMER);
    console.log('DATA_FEED_IS_ACTIVE', DATA_FEED_IS_ACTIVE);
}
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
        'item': null,
        'price': null,
        'signature': null,
        'user_input': null,
    },
};
// }}}1

// Define Emission Hooks {{{1
var activeEmitter = function() {};
var passiveEmitter = function() {};
// }}}1

// Define a hook for the active emission point. {{{1
var activeEmission = function(input) {
    activeEmitter(input);
};

// Define a hook for the passive emission point.
var passiveEmission = function(input) {
    passiveEmitter(input);
};
// }}}1

// Intro.
data_container['message'] = 'Greetings from the server.';
// Init the signature variable.
// Our transmission dictionary will become:
//      {'item': val, 'price': val, 'signature': val}
// to demonstrate the flow of data from the client to the server.
let signature = null;
let user_input = null;

// This needs to be in the message section (onMessage) is still am option as we
// might need to send config from the client. For example, a item name.
// console.log('[server:onMessage] received request:', message);
wss.on('connection', function(ws) {
    /*-----------------------------------------------------------------;
    ; This section runs only on a 'message receive from client' event. ;
    ;-----------------------------------------------------------------*/

    // on.message {{{1
    ws.on('message', function(message) {
        let incoming_transmission = JSON.parse(message);
        console.log('[server:onConnection:onMessage] received request:', incoming_transmission);
        // Handle the requests from the client.
        // Inject the request message into the signature.
        signature = incoming_transmission['signature'];
        user_input = incoming_transmission['request'];

        // First update the JSON object by adding the signature component.
        // Guard against undefined signatures.
        // if(signature === undefined){
        //     signature = 'None';
        // }
        // The 'input' argument is the pure object that has been imported
        // through the data stream. We are adding the extra 'signature' field
        // here.
        data_container.package['signature'] = signature;
        data_container.package['user_input'] = user_input;

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
    // }}}1

    /*---------------------------------------;
    ; This section runs only on data update. ;
    ;---------------------------------------*/

    // Plug the PASSIVE emission hook. {{{1
    passiveEmitter = function(input) {
        if(!DATA_FEED_IS_ACTIVE){
            // Debug the input data stream.
            console.log('NO INPUT_STREAM.');

            // Mimic an active transmission here. But update the feed flag to
            // indicate a dropped data feed.
            // Handle utility fields.
            data_container.records['server_update'] = true;
            data_container.records['client_input'] = false;
            data_container.records['feed_active'] = false;
            data_container.flags['is_first_transmission'] = false;
            // Handle data fields.
            data_container.package['item'] = 'void';
            data_container.package['price'] = -1.0;
            data_container.package['signature'] = 'void';
            data_container.package['user_input'] = 'void';

            // Sending the payload to all clients.
            wss.clients.forEach(function(client) {
                // Prepare for transmission.
                let transmission = JSON.stringify(data_container);
                // Debug
                console.log('[server:onConnection:onPassive] Sending:\n', transmission);
                // Send the transmission.
                client.send(transmission);
                // Reser flag.
                data_container.records['server_update'] = false;
            });
        }
    }
    // }}}1

    // Plug the ACTIVE emission hook. {{{1
    activeEmitter = function(input) {
        // Debug the input data stream.
        console.log('INPUT_STREAM:', input);

        // First update the JSON object by adding the signature component.
        // Guard against undefined signatures.
        // if(signature === undefined){
        //     signature = 'None';
        // }
        // The 'input' argument is the pure object that has been imported
        // through the data stream. We are adding the extra 'signature' field
        // here.

        // Then update carrier.
        // Handle utility fields.
        data_container.records['server_update'] = true;
        data_container.records['client_input'] = false;
        data_container.records['feed_active'] = true;
        data_container.flags['is_first_transmission'] = false;
        // Handle data fields.
        data_container['package'] = input;
        data_container.package['signature'] = signature;
        data_container.package['user_input'] = user_input;

        // Sending the payload to all clients.
        wss.clients.forEach(function(client) {
            // Prepare for transmission.
            let transmission = JSON.stringify(data_container);
            // Debug
            console.log('[server:onConnection:onUpdate] Sending:\n', transmission);
            // Send the transmission.
            client.send(transmission);
            // Reser flag.
            data_container.records['server_update'] = false;
        });
    };
    // }}}1

    /*-------------------------------------------------;
    ; This section runs only once at first connection. ;
    ;-------------------------------------------------*/
    // Complete the connection by sending the payload to all clients.
    wss.clients.forEach(function(client) {
        // Prepare for transmission.
        let transmission = JSON.stringify(data_container);
        // Debug
        console.log('[server:onConnection:init] Sending:\n', transmission);
        // Send the transmission.
        client.send(transmission);
    });
});

// vim: fdm=marker ts=4
