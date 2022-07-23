import express from 'express'
import expressWs from 'express-ws'
import ViGEmClient from 'vigemclient'

const vgClient = new ViGEmClient()
vgClient.connect()
const controller = vgClient.createDS4Controller()
controller.connect()

const app = express()
expressWs(app)

app.use(express.static('public'))

function getFlag(uint8, index) {
  return uint8[0] & (1 << index)
}

app.ws('/ws', (ws, req) => {
  ws.on('message', (msg) => {

    const uint8 = new Uint8Array(msg)

    const triangleDown = getFlag(uint8, 0)
    const squareDown = getFlag(uint8, 1)
    const xDown = getFlag(uint8, 2)
    const circleDown = getFlag(uint8, 3)
    const sliderOneRight = getFlag(uint8, 4)
    const sliderOneLeft = getFlag(uint8, 5)
    const sliderTwoRight = getFlag(uint8, 6)
    const sliderTwoLeft = getFlag(uint8, 7)

    controller.button.TRIANGLE.setValue(triangleDown)
    controller.button.SQUARE.setValue(squareDown)
    controller.button.CROSS.setValue(xDown)
    controller.button.CIRCLE.setValue(circleDown)
    controller.button.SHOULDER_RIGHT.setValue(sliderOneRight)
    controller.button.SHOULDER_LEFT.setValue(sliderOneLeft)
    controller.button.TRIGGER_RIGHT.setValue(sliderTwoRight)
    controller.button.TRIGGER_LEFT.setValue(sliderTwoLeft)
  })
})

app.listen(8080,()=>{
  console.log('Server is running on http://localhost:8080')
})