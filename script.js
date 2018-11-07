// Helper functions.

// Function: generateTable {{{1
function generateTable(object) {
    // Dummy data
    /*
    var myObj = [{
        "Book ID": "1",
        "Book Name": "Computer Architecture",
        "Category": "Computers",
        "Price": "125.60"
    },
    {
        "Book ID": "2",
        "Book Name": "Asp.Net 4 Blue Book",
        "Category": "Programming",
        "Price": "56.00"
    },
    {
        "Book ID": "3",
        "Book Name": "Popular Science",
        "Category": "Science",
        "Price": "210.40"
    }
    ]
    */
    var myObj = [object];
    // EXTRACT VALUE FOR HTML HEADER.
    // ('Book ID', 'Book Name', 'Category' and 'Price')
    var col = [];
    for (var i = 0; i < myObj.length; i++) {
        for (var key in myObj[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    // CREATE DYNAMIC TABLE.
    var table = document.createElement('table');

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1); // TABLE ROW.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement('th'); // TABLE HEADER.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < myObj.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = myObj[i][col[j]];
        }
    }

    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    var divContainer = document.getElementById('showData');
    divContainer.innerHTML = '';
    divContainer.appendChild(table);
}
// }}}1

// DATA Controller {{{1
function updateData(boolean_object){
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
