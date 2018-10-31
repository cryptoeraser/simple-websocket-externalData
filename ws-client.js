// A simple client-side script that expects a JSON object.
// data from a server.
var ws = new WebSocket('ws://localhost:3000');

// onOpen {{{1
ws.onopen = function() {
    setTitle("TICKER_SERVER_STATUS: connected");
};
// }}}1

// onClose {{{1
ws.onclose = function() {
    setTitle('TICKER_SERVER_STATUS: disconnected');
};
// }}}1

// onMessage {{{1
ws.onmessage = function(payload) {
    // Debug
    console.log('[client] received reply:', payload.data);

    // Handle incoming transmission.
    var transmission = JSON.parse(payload.data);
    if(transmission['data'] === null){
        console.log('plain_reply');
        printMessage(transmission.message);
    }
    else {
        // This function is defined in an other script file called 'script.js'.
        // This a bad practice as we are relying on a shared global
        // scope. However, this might be ok for now.
        generateTable(transmission.data);
        console.log('container with data');
    }
};
// }}}1

// Request with a button. {{{1
var sendRequest = function() {
    var _request = 'byClick';
    console.log('[client] sent request:', _request);
    ws.send(_request);
};
// }}}1

// Request with Interval. {{{1
var tickerCycle = setInterval(function() {
    var _request = 'byInterval';
    console.log('[client] sent request:', _request);
    ws.send(_request);
}, 1000);
// }}}1

// Set Title {{{1
function setTitle(title) {
    document.querySelector('h2').innerHTML = title;
}
// }}}1

// Print Message {{{1
function printMessage(message) {
    var p = document.createElement('p');
    p.innerText = message;
    document.querySelector('div.messages').appendChild(p);
}
// }}}1

// vim: fdm=marker ts=4
