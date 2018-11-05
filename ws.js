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
            emission(obj);
        });
    }
});
// }}}1

// Data Feed Loop {{{1
if(!DATA_FEED_IS_ACTIVE){
    DATA_CHECK_TIMER = setInterval( function() {
        console.log('__CHECK_DATA_FEED__');
        console.log('DATA_FEED_IS_ACTIVE:', DATA_FEED_IS_ACTIVE);
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
        'fruit': null,
        'price': null,
        'signature': null,
    },
};
// }}}1

// Define Emission Hooks {{{1
var emitter = function() {};
var passiveEmitter = function() {};
// }}}1

// Define a hook for the emission point. {{{1
var emission = function(input) {
    // console.log('__CALL:1');
    if(DATA_FEED_IS_ACTIVE){
        emitter(input);
    }else{
        passiveEmitter(input);
    }
};

// Define a hook for the emission point.
var passiveEmission = function(input) {
    // console.log('__CALL:2');
    passiveEmitter(input);
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

    // on.message {{{1
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
    // }}}1

    /*---------------------------------------;
    ; This section runs only on data update. ;
    ;---------------------------------------*/

    // Plugin the PASSIVE emission hook. {{{1
    passiveEmitter = function(input) {
        if(!DATA_FEED_IS_ACTIVE){
            // Mimic an active transmission here. But update the feed flag to
            // indicate a dropped data feed.
            // Handle utility fields.
            data_container.records['server_update'] = true;
            data_container.records['client_input'] = false;
            data_container.records['feed_active'] = false;
            data_container.flags['is_first_transmission'] = false;
            // Handle data fields.
            data_container.package['fruit'] = 'void';
            data_container.package['price'] = -1.0;
            data_container.package['signature'] = 'void';

            // Sending the payload to all clients.
            wss.clients.forEach(function(client) {
                // Prepare for transmission.
                let transmission = JSON.stringify(data_container);

                // Debug
                console.log('[server:onConnection:onPassive] Sending:\n', transmission);
                //
                // Send the transmission.
                client.send(transmission);
                // Reser flag.
                data_container.records['server_update'] = false;
            });
        }
    }
    // }}}1

    // Plugin the ACTIVE emission hook. {{{1
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
        //
        // Send the transmission.
        client.send(transmission);
    });
});

// vim: fdm=marker ts=4
