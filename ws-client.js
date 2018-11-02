// TODO: Track the stream status as well, stream "ON" or stream "OFF".
// A simple client-side script that expects a JSON object.
// data from a server.
var ws = new WebSocket('ws://localhost:3000');

// onOpen {{{1
ws.onopen = function() {
    // setTitle("TICKER_SERVER_STATUS: connected");
    updateStatus('connected', 'on');
    updateStatus('disconnected', 'off');
    sendRequest('BTC');
};
// }}}1

// onClose {{{1
ws.onclose = function() {
    // setTitle('TICKER_SERVER_STATUS: disconnected');
    updateStatus('connected', 'off');
    updateStatus('disconnected', 'on');
    updateStatus('server_reply', 'off');
    updateStatus('client_input', 'off');
};
// }}}1

// onMessage {{{1
ws.onmessage = function(payload) {
    // Debug
    // console.log('[client] received reply:', payload.data);

    // Handle incoming transmission.
    var transmission = JSON.parse(payload.data);

    // If the package is empty, this means we are receiving the very first
    // transmission.
    if(transmission['package'] === null){
        // client_input
        if(transmission.message === 'client_input'){
            updateStatus(transmission.message, 'on');
            updateStatus('server_reply', 'off');
        // server_reply
        } else {
            updateStatus(transmission.message, 'on');
            updateStatus('client_input', 'off');
        }
    }
    else {
        // This function is defined in an other script file called 'script.js'.
        // This a bad practice as we are relying on a shared global
        // scope. However, this might be ok for now.
        // printMessage(transmission.message);
        // client_input
        if(transmission.message === 'client_input'){
            updateStatus(transmission.message, 'on');
            updateStatus('server_reply', 'off');
        // server_reply
        } else {
            updateStatus(transmission.message, 'on');
            updateStatus('client_input', 'off');
        }

        // Populate the tables.
        generateTable(transmission.package);
    }
};
// }}}1

// Drop-Down Menu {{{1
function doSomething(index){
    let req;
    switch (index) {
        case 0:
            req = 'BTC'
            sendRequest(req);
            break;
        case 1:
            req = 'ETH'
            sendRequest(req);
            break;
        case 2:
            req = 'ZEC'
            sendRequest(req);
            break;
        case 3:
            req = 'XMR'
            sendRequest(req);
            break;
        default:
            req = 'None';
    }
}
// }}}1

// Request with a button. {{{1
function sendRequest(request) {
    let _request = (typeof request === 'undefined') ? 'None' : request;
    console.log('[client] send request:', _request);
    ws.send(_request);
}
// }}}1

// Request with Interval. {{{1
// var tickerCycle = setInterval(function() {
//     var _request = 'byInterval';
//     console.log('[client] sent request:', _request);
//     ws.send(_request);
// }, 1000);
// }}}1

// Set Title {{{1
function setTitle(title) {
    document.querySelector('h2').innerHTML = title;
}
// }}}1

function updateStatus(register, state){
    let status = {
        'connected': {
            'on': '#117A65',
            'off': '#D6DBDF'
        },
        'disconnected': {
            'on': '#922B21',
            'off': '#D6DBDF'
        },
        'client_input': {
            'on': '#EB984E',
            'off': '#D6DBDF'
        },
        'server_reply': {
            'on': '#EB984E',
            'off': '#D6DBDF'
        }
    };
    // console.log('debug', status[register][state]);
    document.getElementById(register).style.color = status[register][state];
    // document.getElementById("connected").style.color = "#117A65";
    // document.getElementById("connected").style.fontStyle = "bold";
;
}

// Print Message {{{1
function printMessage(message) {
    var p = document.createElement('p');
    p.innerText = message;
    document.querySelector('div.messages').appendChild(p);
}
// }}}1

// vim: fdm=marker ts=4
