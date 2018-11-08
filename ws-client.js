// A simple client-side script that expects a JSON object.
// data from a server.
//
// TODO:
//      Track the stream status as well, stream "ON" or stream "OFF".
//
//      Build a wrapper for the 'updateStatus' function inorder to
//      prevent function call repetition.
//
var ws = new WebSocket('ws://localhost:3000');

// Request Container {{{1
// Just like the data container on the server side, we should have a request
// container on the client side.
let request_container = (function(){
    let signature;
    let user_input;
    return {
        // Init method.
        init: function() {
            this.signature = 'none';
            this.user_input = 'none';
        },
        // Getter method.
        getValue: function(field) {
            return this[field];
        },
        // Setter method.
        setValue: function(field, val) {
            this[field] = val;
        },
        // Return object.
        getObject: function() {
            return {
                'signature': this['signature'],
                'user_input': this['user_input'],
            };
        },
    };
})();
// }}}1

// Init the request container.
request_container.init();

// onOpen {{{1
ws.onopen = function() {
    updateStatus({'connected': true});
    updateStatus({'disconnected': false});
    updateStatus({'feed_online': true});
    updateStatus({'feed_offline': false});
    // Set a default signature here.
    request_container.setValue('signature', 'BTC');
    sendRequest(request_container.getObject());
};
// }}}1

// onClose {{{1
ws.onclose = function() {
    updateStatus({'connected': false});
    updateStatus({'disconnected': true});
    updateStatus({'client_input': false});
    updateStatus({'server_update': false});
    updateStatus({'feed_online': false});
    updateStatus({'feed_offline': true});
};
// }}}1

// onMessage {{{1
ws.onmessage = function(payload) {
    // Debug
    // console.log('[client] received reply:', payload.data);

    // Handle incoming transmission.
    var transmission = JSON.parse(payload.data);

    // The 'feed' related flag is sent as a single boolean from the server. We
    // need to keep track of the dual state required by the client. All other
    // flags are already dual state, for example:
    //      'clien_input': false/true 'server_update': false/true etc.
    if(transmission.records.feed_active){
        transmission.records['feed_online'] = true;
        transmission.records['feed_offline'] = false;
    } else {
        transmission.records['feed_online'] = false;
        transmission.records['feed_offline'] = true;
    }

    // If the package is empty, this means we are receiving the very first
    // transmission.
    if(transmission.flags['is_first_transmission'] === true){
        // Implement any steps related to a 'is_first_transmission' event here
        // if needed.
        updateStatus(transmission.records);
    } else {
        // This function is defined in an other script file called 'script.js'.
        // This a bad practice as we are relying on a shared global
        // scope. However, this might be ok for now.
        // printMessage(transmission.message);
        // client_input
        updateStatus(transmission.records);

        // Populate the tables.
        // Move outside this block if you need to populate the table even when
        // there are no values.
        // generateTable(transmission.package);
        updateDataFields(transmission.package);
    }
};
// }}}1

// Populate HTML data fields. {{{1
function updateDataFields(dataObject){
    for (var field in dataObject) {
        // console.log('-debug-', field);
        document.getElementById(field).innerHTML = dataObject[field];
    }
}
// }}}1

// Drop-Down Menu {{{1
function evalMenu(index){
    let req;
    switch (index) {
        case 0:
            req = 'BTC'
            request_container.setValue('signature', req);
            sendRequest(request_container.getObject());
            break;
        case 1:
            req = 'ETH'
            request_container.setValue('signature', req);
            sendRequest(request_container.getObject());
            break;
        case 2:
            req = 'ZEC'
            request_container.setValue('signature', req);
            sendRequest(request_container.getObject());
            break;
        case 3:
            req = 'XMR'
            request_container.setValue('signature', req);
            sendRequest(request_container.getObject());
            break;
        default:
            req = 'none';
            request_container.setValue('signature', req);
            sendRequest(request_container.getObject());
    }
}
// }}}1

// Handle the send button. {{{1
function evalInputField() {
    let val = document.getElementById('user_field');
    // Debug
    // console.log('debug_evalInputField:', val.value);
    request_container.setValue('user_input', val.value);
    sendRequest(request_container.getObject());
    // Reset the text box.
    val.value ='';
}
// }}}1

// Handle send with ENTER. {{{1
// From:
//  https://stackoverflow.com/questions/29943/how-to-submit-a-form-when-the-return-key-is-pressed
function checkSubmit(e) {
    if(e && e.keyCode == 13) {
        // Force field read.
        evalInputField();
    }
}
// }}}1

// Request with a button. {{{1
function sendRequest(requestObject) {
    let _request = (typeof requestObject === 'undefined') ? {signature: null, request: null} : requestObject;
    // console.log('[client] send request:', _request);
    let transmission = JSON.stringify(_request);
    ws.send(transmission);
}
// }}}1

// UI Controller {{{1
function updateStatus(boolean_object){
    // console.log('debug:', boolean_object);
    let status = {
        'connected': {
            'on': '#117A65',
            'off': '#D6DBDF',
        },
        'disconnected': {
            'on': '#922B21',
            'off': '#D6DBDF',
        },
        'client_input': {
            'on': '#EB984E',
            'off': '#D6DBDF',
        },
        'server_update': {
            'on': '#EB984E',
            'off': '#D6DBDF',
        },
        'feed_online' : {
            'on': '#117A65',
            'off': '#D6DBDF',
        },
        'feed_offline': {
            'on': '#922B21',
            'off': '#D6DBDF',
        },
    };

    for (var k in boolean_object) {
        if (status.hasOwnProperty(k)) {
            // console.log('debug:', boolean_object[k]);
            let state = boolean_object[k] ? status[k]['on'] : status[k]['off'];
            // console.log('debug:', state);
            document.getElementById(k).style.color = state;
        }
    }
}
// }}}1

// vim: fdm=marker ts=4
