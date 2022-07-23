const websocket = new WebSocket('ws://' + window.location.host + '/ws')

// Adjusts how tall the touch slider area is
const sliderHeightRatio = 0.5

// Display and input variables
let w, h
let sliderX, sliderY, sliderWidth, sliderHeight
let triangleX, triangleY, triangleWidth, triangleHeight
let squareX, squareY, squareWidth, squareHeight
let xX, xY, xWidth, xHeight
let circleX, circleY, circleWidth, circleHeight

// Controller state variables
let triangleDown = false
let squareDown = false
let xDown = false
let circleDown = false
let sliderOneRight = false
let sliderOneLeft = false
let sliderTwoRight = false
let sliderTwoLeft = false

function addIf(flag, index) {
    if(!flag) return 0
    return Math.pow(2, index)
}

function sendState() {
    const uint8 = new Uint8Array(1)
    uint8[0] += addIf(triangleDown, 0)
    uint8[0] += addIf(squareDown, 1)
    uint8[0] += addIf(xDown, 2)
    uint8[0] += addIf(circleDown, 3)
    uint8[0] += addIf(sliderOneRight, 4)
    uint8[0] += addIf(sliderOneLeft, 5)
    uint8[0] += addIf(sliderTwoRight, 6)
    uint8[0] += addIf(sliderTwoLeft, 7)
    websocket.send(uint8.buffer)
}

function isPointInside(px, py, x, y, w, h) {
    return px > x && px < x + w && py > y && py < y + h
}

function updateVars() {
    w = window.innerWidth
    h = window.innerHeight

    sliderX = 0
    sliderY = 0
    sliderWidth = w
    sliderHeight = sliderHeightRatio * h

    triangleX = 0
    triangleY = sliderHeightRatio * h
    triangleWidth = w / 4.0
    triangleHeight = (1.0 - sliderHeightRatio) * h

    squareX = w / 4.0
    squareY = sliderHeightRatio * h
    squareWidth = w / 4.0
    squareHeight = (1.0 - sliderHeightRatio) * h

    xX = squareX + (w / 4.0)
    xY = sliderHeightRatio * h
    xWidth = w / 4.0
    xHeight = (1.0 - sliderHeightRatio) * h

    circleX = xX + (w / 4.0)
    circleY = sliderHeightRatio * h
    circleWidth = w / 4.0
    circleHeight = (1.0 - sliderHeightRatio) * h
}
updateVars()

function setup() {
    canvas=createCanvas(w, h)
    background(200)
}

function updateFaceButtons() {
    triangleDown = false
    squareDown = false
    xDown = false
    circleDown = false
    for(const touch of touches) {
        if(isPointInside(touch.x, touch.y, triangleX, triangleY, triangleWidth, triangleHeight)) {
            triangleDown = true
        }
        if(isPointInside(touch.x, touch.y, squareX, squareY, squareWidth, squareHeight)) {
            squareDown = true
        }
        if(isPointInside(touch.x, touch.y, xX, xY, xWidth, xHeight)) {
            xDown = true
        }
        if(isPointInside(touch.x, touch.y, circleX, circleY, circleWidth, circleHeight)) {
            circleDown = true
        }
    }
}

function updateSliders() {
    // TODO
}

function update() {
    updateFaceButtons()
    updateSliders()
    sendState()
}

function draw() {
    update()

    fill(color('#807f8f'))
    rect(sliderX, sliderY, sliderWidth, sliderHeight)
    fill(color('#27bb64'))
    rect(triangleX, triangleY, triangleWidth, triangleHeight)
    fill(color('#ee76bc'))
    rect(squareX, squareY, squareWidth, squareHeight)
    fill(color('#3ea7ec'))
    rect(xX, xY, xWidth, xHeight)
    fill(color('#dd595e'))
    rect(circleX, circleY, circleWidth, circleHeight)
}

window.onresize = function() {
    updateVars()
    canvas.size(w, h)
}

function touchStarted(event) {
    if(!fullscreen()) {
        fullscreen(true)
        return
    }
}
