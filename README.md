# simple-websocket-externalData
This an improved version of the simple-websocket-setup project. The aim is to demonstrate the use of an independent signal source.

<p align="center">
<img width="800" alt="Final Product"
src="https://github.com/cryptoeraser/simple-websocket-externalData/blob/master/docs/simple-websocket-externalData_demo.png">
<p align="center"><font size="1">A still from the final product.</font></p>
</p>

## The Data Writer ##
This tiny script is responsible for generating a mock JSON file stream that is saved
and constantly updated inside a `./data/object.json` file. The purpose here is
mimicing an independent data stream that can be anything: data coming from an
exchange, a sensor reading, anything.

<p align="center">
<img width="800" alt="Sample Result"
src="https://github.com/cryptoeraser/simple-websocket-externalData/blob/master/docs/simple-websocket-externalData_dataWriterDemo.gif">
<p align="center"><font size="1">Demo results for the data_writer tool.</font></p>
</p>

## The Data Writer ##
The server/client workflow.

This is the final state of my WebSocket test project. The aim was to build a simple server/client application that is capable of collecting, processing and exchanging data.

The stream in this case-study is just mock data being written to a JSON file. The data stream could have been anything from market data to a sensor stream.

The server is capable of processing the incoming data and passing it to the client. In return, the client is able to send messages to the server and alter the state of the data being emitted.

The right side of the UI demonstrates the client side input. Users can change the signature through the drop-down menu or simply send inputs to the server using the text-input box.

In this case "Signature" and "Input" are just there to demonstrate that data can be passed from the client to the server and the input will be returned to the user through the data stream.

<p align="center">
<img width="800" alt="Sample Result"
src="https://github.com/cryptoeraser/simple-websocket-externalData/blob/master/docs/simple-websocket-externalData_final.gif">
<p align="center"><font size="1">Demo results for the server/client workflow.</font></p>
</p>

Higher quality demo video is available [on Vimeo](https://vimeo.com/299571259).

## Credits ##
Special thanks to:
[My mentor and friend Diego Perini](https://github.com/diegoperini)
