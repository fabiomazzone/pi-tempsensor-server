import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'

const app = express()

const server = http.createServer(app)

const wss = new WebSocketServer({server})

const temperatureActionCreator = temp => ({
  type: 'temp',
  payload: {
    temp: temp
  }
})

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function* tempGeneratorMaker() {
  while(true) {
    yield getRandomArbitrary(10, 30)
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