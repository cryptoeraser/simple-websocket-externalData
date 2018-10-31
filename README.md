# simple-websocket-externalData
This an improved version of the simple-websocket-setup project. The aim is to demonstrate the use of an independent signal source.


## The Data Writer ##
This tiny script is responsible for generating a mock JSON file stream that is saved
and constantly updated inside a `./data/object.json` file. The purpose here is
mimicing an independent data stream that can be anything: data coming from an
exchange, a sensor reading, anything.

<p align="center">
<img width="800" alt="Sample Result"
src="https://github.com/cryptoeraser/simple-websocket-externalData/blob/master/docs/simple-websocket-externalData_dataWriterDemo.gif">
<p align="center"><font size="1">Demo results.</font></p>
</p>
