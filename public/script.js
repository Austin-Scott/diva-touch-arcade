const websocket = new WebSocket('ws://' + window.location.host + '/ws')

// Adjusts how tall the touch slider area is
const sliderHeightRatio = 0.5

// Adjusts how far you need to slide before the slide state changes
const sliderDistanceThreshold = 0.01

// Adjusts how wide the touch slider touch indicator is
const touchIndicatorWidthRatio = 1.0 / 32.0

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

// For haptics
let previousTriangleDown = false
let previousSquareDown = false
let previousXDown = false
let previousCircleDown = false

// For touch slider state
let sliderOneTouchId = null
let sliderOneStartX = null
let sliderOneCurrentX = null
let sliderOneMaxX = null
let sliderOneDirection = 0
let sliderTwoTouchId = null
let sliderTwoStartX = null
let sliderTwoCurrentX = null
let sliderTwoMaxX = null
let sliderTwoDirection = 0

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
    w = screen.width
    h = screen.height

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
    frameRate(120)
}

function updateHaptics() {
    if((!previousTriangleDown && triangleDown) 
        || (!previousSquareDown && squareDown) 
        || (!previousXDown && xDown) 
        || (!previousCircleDown && circleDown)) {

        if(navigator && navigator.vibrate) {
            navigator.vibrate(50)
        }
    }

    previousTriangleDown = triangleDown
    previousSquareDown = squareDown
    previousXDown = xDown
    previousCircleDown = circleDown
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
    sliderOneLeft = false
    sliderOneRight = false
    sliderTwoLeft = false
    sliderTwoRight = false

    let sliderOneUpdatedFlag = false
    let sliderTwoUpdatedFlag = false

    // const testTouches = []
    // if(mouseIsPressed) {
    //     testTouches.push({
    //         x: mouseX,
    //         y: mouseY,
    //         id: 1
    //     })
    // }

    // for(const touch of testTouches) {
    for(const touch of touches) {
        if(isPointInside(touch.x, touch.y, sliderX, sliderY, sliderWidth, sliderHeight)) {
            if(touch.id == sliderOneTouchId) {
                sliderOneUpdatedFlag = true
                sliderOneCurrentX = touch.x
                if(sliderOneDirection == 0) {
                    if(sliderOneCurrentX - sliderOneStartX > w * sliderDistanceThreshold) {
                        sliderOneDirection = 1
                        sliderOneRight = true
                        sliderOneMaxX = sliderOneCurrentX
                    } else if(sliderOneStartX - sliderOneCurrentX > w * sliderDistanceThreshold) {
                        sliderOneDirection = -1
                        sliderOneLeft = true
                        sliderOneMaxX = sliderOneCurrentX
                    }
                } else if(sliderOneDirection == -1) {
                    if(sliderOneCurrentX < sliderOneMaxX) {
                        sliderOneMaxX = sliderOneCurrentX
                    }
                    if(sliderOneCurrentX - sliderOneMaxX > w * sliderDistanceThreshold) {
                        sliderOneDirection = 1
                        sliderOneRight = true
                        sliderOneStartX = sliderOneCurrentX
                        sliderOneMaxX = sliderOneCurrentX
                    } else {
                        sliderOneLeft = true
                    }
                } else {
                    if(sliderOneCurrentX > sliderOneMaxX) {
                        sliderOneMaxX = sliderOneCurrentX
                    }
                    if(sliderOneMaxX - sliderOneCurrentX > w * sliderDistanceThreshold) {
                        sliderOneDirection = -1
                        sliderOneLeft = true
                        sliderOneStartX = sliderOneCurrentX
                        sliderOneMaxX = sliderOneCurrentX
                    } else {
                        sliderOneRight = true
                    }
                }
            } else if (touch.id == sliderTwoTouchId) {
                sliderTwoUpdatedFlag = true
                sliderTwoCurrentX = touch.x
                if(sliderTwoDirection == 0) {
                    if(sliderTwoCurrentX - sliderTwoStartX > w * sliderDistanceThreshold) {
                        sliderTwoDirection = 1
                        sliderTwoRight = true
                        sliderTwoMaxX = sliderTwoCurrentX
                    } else if(sliderTwoStartX - sliderTwoCurrentX > w * sliderDistanceThreshold) {
                        sliderTwoDirection = -1
                        sliderTwoLeft = true
                        sliderTwoMaxX = sliderTwoCurrentX
                    }
                } else if(sliderTwoDirection == -1) {
                    if(sliderTwoCurrentX < sliderTwoMaxX) {
                        sliderTwoMaxX = sliderTwoCurrentX
                    }
                    if(sliderTwoCurrentX - sliderTwoMaxX > w * sliderDistanceThreshold) {
                        sliderTwoDirection = 1
                        sliderTwoRight = true
                        sliderTwoStartX = sliderTwoCurrentX
                        sliderTwoMaxX = sliderTwoCurrentX
                    } else {
                        sliderTwoLeft = true
                    }
                } else {
                    if(sliderTwoCurrentX > sliderTwoMaxX) {
                        sliderTwoMaxX = sliderTwoCurrentX
                    }
                    if(sliderTwoMaxX - sliderTwoCurrentX > w * sliderDistanceThreshold) {
                        sliderTwoDirection = -1
                        sliderTwoLeft = true
                        sliderOTwotartX = sliderTwoCurrentX
                        sliderTwoMaxX = sliderTwoCurrentX
                    } else {
                        sliderTwoRight = true
                    }
                }

            } else if(sliderOneTouchId == null) {
                sliderOneUpdatedFlag = true
                sliderOneTouchId = touch.id
                sliderOneStartX = touch.x
                sliderOneCurrentX = touch.x
                sliderOneMaxX = touch.x
                sliderOneDirection = 0
            } else if(sliderTwoTouchId == null) {
                sliderTwoUpdatedFlag = true
                sliderTwoTouchId = touch.id
                sliderTwoStartX = touch.x
                sliderTwoCurrentX = touch.x
                sliderTwoMaxX = touch.x
                sliderTwoDirection = 0
            }
        }
    }
    if(!sliderOneUpdatedFlag) {
        sliderOneTouchId = null
        sliderOneStartX = null
        sliderOneCurrentX = null
        sliderOneMaxX = null
        sliderOneDirection = 0
    }
    if(!sliderTwoUpdatedFlag) {
        sliderTwoTouchId = null
        sliderTwoStartX = null
        sliderTwoCurrentX = null
        sliderTwoMaxX = null
        sliderTwoDirection = 0
    }
}

function update() {
    updateVars()
    updateFaceButtons()
    updateHaptics()
    updateSliders()
    sendState()
}

function draw() {
    update()

    fill(color('#807f8f'))
    rect(sliderX, sliderY, sliderWidth, sliderHeight)
    if(sliderOneCurrentX != null) {
        fill(color('#ffffff'))
        const indicatorWidth = touchIndicatorWidthRatio * w
        const indicatorX = sliderOneCurrentX - (indicatorWidth / 2.0)
        const indicatorY = 0
        const indicatorHeight = sliderHeight
        rect(indicatorX, indicatorY, indicatorWidth, indicatorHeight)
    }
    if(sliderTwoCurrentX != null) {
        fill(color('#ffffff'))
        const indicatorWidth = touchIndicatorWidthRatio * w
        const indicatorX = sliderTwoCurrentX - (indicatorWidth / 2.0)
        const indicatorY = 0
        const indicatorHeight = sliderHeight
        rect(indicatorX, indicatorY, indicatorWidth, indicatorHeight)
    }

    if(triangleDown) {
        fill(color('#000000'))
    } else {
        fill(color('#27bb64'))
    }
    rect(triangleX, triangleY, triangleWidth, triangleHeight)

    if(squareDown) {
        fill(color('#000000'))
    } else {
        fill(color('#ee76bc'))
    }
    rect(squareX, squareY, squareWidth, squareHeight)

    if(xDown) {
        fill(color('#000000'))
    } else {
        fill(color('#3ea7ec'))
    }
    rect(xX, xY, xWidth, xHeight)

    if(circleDown) {
        fill(color('#000000'))
    } else {
        fill(color('#dd595e'))
    }
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
