import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import W1temp  from 'w1temp'

const app = express()

const server = http.createServer(app)

const wss = new WebSocketServer({server})

W1temp.setGpioPower(13)
W1temp.setGpioData(6)

const sensorIDs = await W1temp.getSensorsUids();

const sensor = await W1temp.getSensor(sensorIDs[0]);

const temperatureActionCreator = temp => ({
  type: 'temp',
  payload: {
    temp: temp
  }
})

function* tempGeneratorMaker() {
  while(true) {
    yield sensor.getTemperature();
  }
}

const tempGenerator = tempGeneratorMaker()

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const action = JSON.parse(message)
    console.log('received: ', action)

    switch (action.type) {
      case "ping":
        ws.send(JSON.stringify(temperatureActionCreator(tempGenerator.next().value)));
        break;
    }
  })
})

app.use(express.static('public'))

server.listen(process.env.PORT || 8999, () => {
  console.log(`Server started on port ${server.address().port}`)
})