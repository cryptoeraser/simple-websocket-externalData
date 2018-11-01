// A tiny data writer tool that writes to a JSON file inorder to
// simulate constant and independent data stream.
//
// The stream should look something like this:
//
//      DATA_STREAM: { fruit: 'banana', price: 0.8612 }
//      File has been created

var fs = require('fs');

// Fruit selector.
var generator = function(){
    var fruitBasket = [
        'banana',
        'apple',
        'lemon',
        'pear',
        'orange',
        'peach',
        'cherry',
        'apricot',
        'blueberry',
        'fig',
    ];

    var randPick = fruitBasket[Math.floor(Math.random() * fruitBasket.length)];
    return randPick;
};

// Stream some fake data to a JSON file.
setInterval(function() {
    // Create the data object.
    var my_data = {
        'fruit': generator(),
        'price': (Math.random()).toFixed(4)
    };

    // Debug.
    console.log('DATA_STREAM:', my_data);

    // Perform the write operation.
    fs.writeFile('./data/object.json', JSON.stringify(my_data), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        // console.log("File has been created");
    });
}, 0);
