import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js'

/**
 * 常數
 */
const FLEX = 'flex'
const NONE = 'none'
const keyCodeD = 68
const keyCodeF = 70
const CROSS = 'cross'
const IMAGE1 = 'image-1'
const IMAGE2 = 'image-2'
const IMAGE3 = 'image-3'
const IMAGE4 = 'image-4'
const IMAGE5 = 'image-5'

/**
 * API
 */
const url = 'https://sheets.googleapis.com/v4/spreadsheets'
const id = '1UbzldKDnnwwWcyYbx-7i10nr-rx_bJMFzSzASHUp3YU'
const sheet = 'Account'
const key = 'AIzaSyCRhiUOa03yd0PobVYEnm5Ch0yXjFh9hww'

/**
 * Dom
 */
const mainInfo = document.querySelector('.main-info')
const gameInfo = document.querySelector('.game-info')
const resultInfo = document.querySelector('.result-info')
const start = document.querySelector('.start')
const restart = document.querySelector('.restart')
const gameScore = document.querySelector('#game-score')
const gameSpeed = document.querySelector('#game-speed')
const gameMin = document.querySelector('#game-time-min')
const gameSec = document.querySelector('#game-time-sec')
const dragControl = document.querySelector('.drag-control')
const interfaceControl = document.querySelector('.interface-control')
const ballControl = document.querySelector('#ball-control')
const passedResult = document.querySelector('#passed')
const missedResult = document.querySelector('#missed')
const performance = document.querySelector('#performance')
const loginInfo = document.querySelector('.login-info')
const login = document.querySelector('.login')
const account = document.querySelector('#account')
const password = document.querySelector('#password')

/**
 * 變數
 */
let passed = 0
let missed = 0
let speed = 33
let performanceRate = 0
const passedArray = []
const missedArray = []
const resetSpeed = 33 // 重置速度
const increaseSpeedRate = 30 // 速度增加速率
const increaseSpeedParams = 0.2 // 速度增減值
const gameTime = 3 // 分鐘
const delayCheckTime = 0.7 // 秒
let buttonActive = false // 使用按鈕點擊
let timeInterval
let currentDrag
const ballParams = { object: ballControl, radius: 75 }
const canvasWidth = 360
const canvasHeight = 300
const canvasLines = []
let cameraXPosition = 0
let cameraYPosition = 0
let cameraZPosition = 5
let animateSpeed = 0.05
const resetAnimateSpeed = 0.1
let collision = false
let checked = false
let isGameInfo = false
let scene, camera, renderer
const holeImages = [IMAGE1, IMAGE2, IMAGE3]
const userInfo = { account: '', password: '' }

/**
 * 監聽
 */
window.addEventListener('keydown', keydownHandle)
window.addEventListener('keyup', keyupHandle)
window.addEventListener('mousedown', mousedownHandler)
window.addEventListener('mousemove', mousemoveHandler)
window.addEventListener('mouseup', mouseupHandler)
start.addEventListener('click', startClickHandler)
restart.addEventListener('click', restartClickHandler)
login.addEventListener('click', loginHandler)

/**
 * 進到介紹介面
 */
function goToInstructionPage() {
  resultInfo.style.display = NONE
  mainInfo.style.display = FLEX
}

/**
 * 進到遊戲介面
 */
function goToGamePage() {
  mainInfo.style.display = NONE
  gameInfo.style.display = FLEX
  isGameInfo = true
}

/**
 * 進到結果介面
 */
function goToResultPage() {
  gameInfo.style.display = NONE
  resultInfo.style.display = FLEX
  isGameInfo = false
}

/**
 * 登入
 */
function loginHandler() {
  const userAccount = account.value
  const userPassword = password.value

  if (userAccount === userInfo.account && userPassword === userInfo.password) {
    goToInstructionPage()
    loginInfo.style.display = NONE
  } else {
    alert('帳號或密碼錯誤')
  }
}

/**
 * 重新開始
 */
function restartClickHandler() {
  goToInstructionPage()
  resetResult()
}

/**
 * 輸出結果
 */
function outputResult() {
  performanceRate = passed
  passedResult.innerHTML = `${passed.toString()}`
  missedResult.innerHTML = `${missed.toString()}`
  performance.innerHTML = `${performanceRate.toString()}%`
}

/**
 重置結果數據
 */
function resetResult() {
  passed = 0
  missed = 0
  performanceRate = 0
}

/**
 * 開始遊戲
 */
function startClickHandler() {
  goToGamePage()
  startCountdown(gameTime)
  getGameScore()
  getGameSpeed()
  initAnimate();
}

/**
 * 分數獲取
 */
function getGameScore() {
  gameScore.innerHTML = passed
}

/**
 * 速度獲取
 */
function getGameSpeed() {
  gameSpeed.innerHTML = speed.toFixed(1)
}

/**
 *  鍵盤點擊按下
 */
function keydownHandle(e) {
  clearInterval(timeInterval)
  if (e.keyCode === keyCodeD) {
    timeInterval = setInterval(() => {
      accelerated()
    }, increaseSpeedRate)
  }
  if (e.keyCode === keyCodeF) {
    timeInterval = setInterval(() => {
      decelerated()
    }, increaseSpeedRate)
  }
}

/**
 *  鍵盤點擊放掉
 */
function keyupHandle() {
  clearInterval(timeInterval)
}

/**
 * 加速
 */
function accelerated() {
  speed += increaseSpeedParams
  animateSpeed += increaseSpeedParams / 100
  gameSpeed.innerHTML = speed.toFixed(1)
}

/**
 * 減速
 */
function decelerated() {
  if (speed <= resetSpeed) {
    speed = resetSpeed
    return
  }
  speed -= increaseSpeedParams
  gameSpeed.innerHTML = speed.toFixed(1)
  if (animateSpeed <= resetAnimateSpeed) {
    animateSpeed = resetAnimateSpeed
    return
  }
  animateSpeed -= increaseSpeedParams / 100
}

/**
 *  滑鼠點擊按下
 */
function mousedownHandler(e) {
  if (!buttonActive) return
  let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
  const upButton = elemBelow.closest('#up')
  const downButton = elemBelow.closest('#down')
  if (upButton) {
    timeInterval = setInterval(() => {
      accelerated()
    }, increaseSpeedRate)
  }
  if (downButton) {
    timeInterval = setInterval(() => {
      decelerated()
    }, increaseSpeedRate)
  }
}

/**
 *  滑鼠移動
 */
function mousemoveHandler(e) {
  let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
  const upButton = elemBelow.closest('#up')
  const downButton = elemBelow.closest('#down')

  const buttonBelows = [upButton, downButton]
  const filterButtonBelow = buttonBelows.filter(Boolean)
  buttonActive = filterButtonBelow.length
}

/**
 *  滑鼠點擊放掉
 */
function mouseupHandler() {
  clearInterval(timeInterval)
}

/**
 * 隨機取值
 */
function randomSymbol(array) {
  return Math.floor(Math.random() * array.length)
}

/**
 * 重置小白球位置
 */
function resetBall({ object, left, top }) {
  dragControl.append(object)
  object.style.left = left + 'px'
  object.style.top = top + 'px'
}

/**
 * 拖曳物件
 */
function objectMove(object) {
  object.onmousedown = function(e) {
    if (checked) return
    let mouseX = e.clientX - object.getBoundingClientRect().left
    let mouseY = e.clientY - object.getBoundingClientRect().top

    document.body.append(object)

    function moveAt(pageX, pageY) {
      let cameraX = (pageX - e.clientX) / 70
      let cameraY = (e.clientY - pageY) / 70

      let distance = Math.sqrt(Math.pow(pageX - e.clientX, 2) + Math.pow(pageY - e.clientY, 2))

      if (distance <= ballParams.radius) {
        object.style.left = pageX - mouseX + 'px'
        object.style.top = pageY - mouseY + 'px'
        cameraXPosition = cameraX
        cameraYPosition = cameraY
      }
    }

    moveAt(e.pageX, e.pageY)

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY)

      object.hidden = true
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      object.hidden = false

      if (!elemBelow) return

      currentDrag = elemBelow
    }

    document.addEventListener('mousemove', onMouseMove)

    object.onmouseup = function() {
      document.removeEventListener('mousemove', onMouseMove)
      object.onmouseup = null
      resetBall({ object, left: 65, top: 65 })
      cameraXPosition = 0
      cameraYPosition = 0
      checked = false
    }
  }

  object.ondragstart = function() {
    return false
  }
}

/**
 *  小白球拖曳
 */
objectMove(ballParams.object)

/**
 *  倒數計時
 */
function startCountdown(duration) {
  let timer = duration * 60

  function updateCountdown() {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0')
    const seconds = (timer % 60).toString().padStart(2, '0')

    gameMin.innerHTML = minutes
    gameSec.innerHTML = seconds

    if (timer === 0) {
      goToResultPage()
      outputResult()
      clearInterval(interval)
    } else {
      timer--
    }
  }

  updateCountdown()
  const interval = setInterval(updateCountdown, 1000)
}

/**
 *  設定單條直線
 */
function setLine(x, y, z) {
  const lines = []
  const lineSize = 4
  const center = new THREE.Vector3(0, 0, 0)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x949391 })

  const vector1 = new THREE.Vector3(x * 2 * lineSize, y * lineSize, z)
  const vector2 = new THREE.Vector3(-x * 2 * lineSize + 0.01, y * lineSize, z)
  const vector3 = new THREE.Vector3(-x * 2 * lineSize - 0.01, y * lineSize, z)
  const vector4 = new THREE.Vector3(-x * 2 * lineSize + 0.05, y * lineSize, z)
  const vector5 = new THREE.Vector3(-x * 2 * lineSize - 0.05, y * lineSize, z)
  const vector6 = new THREE.Vector3(-x * 2 * lineSize + 0.1, y * lineSize, z)
  const vector7 = new THREE.Vector3(-x * 2 * lineSize - 0.1, y * lineSize, z)
  const vector8 = new THREE.Vector3(-x * 2 * lineSize + 0.15, y * lineSize, z)
  const vector9 = new THREE.Vector3(-x * 2 * lineSize - 0.15, y * lineSize, z)
  const vector10 = new THREE.Vector3(-x * 2 * lineSize + 0.2, y * lineSize, z)
  const vector11 = new THREE.Vector3(-x * 2 * lineSize - 0.2, y * lineSize, z)

  const lineGeometry1 = new THREE.BufferGeometry().setFromPoints([center, vector1])
  const lineGeometry2 = new THREE.BufferGeometry().setFromPoints([center, vector2])
  const lineGeometry3 = new THREE.BufferGeometry().setFromPoints([center, vector3])
  const lineGeometry4 = new THREE.BufferGeometry().setFromPoints([center, vector4])
  const lineGeometry5 = new THREE.BufferGeometry().setFromPoints([center, vector5])
  const lineGeometry6 = new THREE.BufferGeometry().setFromPoints([center, vector6])
  const lineGeometry7 = new THREE.BufferGeometry().setFromPoints([center, vector7])
  const lineGeometry8 = new THREE.BufferGeometry().setFromPoints([center, vector8])
  const lineGeometry9 = new THREE.BufferGeometry().setFromPoints([center, vector9])
  const lineGeometry10 = new THREE.BufferGeometry().setFromPoints([center, vector10])
  const lineGeometry11 = new THREE.BufferGeometry().setFromPoints([center, vector11])

  const line1 = new THREE.Line(lineGeometry1, lineMaterial)
  const line2 = new THREE.Line(lineGeometry2, lineMaterial)
  const line3 = new THREE.Line(lineGeometry3, lineMaterial)
  const line4 = new THREE.Line(lineGeometry4, lineMaterial)
  const line5 = new THREE.Line(lineGeometry5, lineMaterial)
  const line6 = new THREE.Line(lineGeometry6, lineMaterial)
  const line7 = new THREE.Line(lineGeometry7, lineMaterial)
  const line8 = new THREE.Line(lineGeometry8, lineMaterial)
  const line9 = new THREE.Line(lineGeometry9, lineMaterial)
  const line10 = new THREE.Line(lineGeometry10, lineMaterial)
  const line11 = new THREE.Line(lineGeometry11, lineMaterial)

  lines.push(line1, line2, line3, line4, line5, line6, line7, line8, line9, line10, line11)

  return lines
}

/**
 *  設定多條直線
 */
function setLines(scene, x, y, z) {
  const line1 = setLine(-x, y, z)
  const line2 = setLine(x, y, z)
  const line3 = setLine(-x, -y, z)
  const line4 = setLine(x, -y, z)
  const line5 = setLine(0, y, z)
  const line6 = setLine(0, -y, z)

  canvasLines.push(...line1, ...line2, ...line3, ...line4, ...line5, ...line6)

  for (const line of canvasLines) {
    scene.add(line)
  }
}

function removeLines(scene) {
  for (const line of canvasLines) {
    scene.remove(line)
  }
}

/**
 *  設定中空圓形
 */
function setHollowCircle(scene, z) {
  const circleRadius = 2
  const holeRadius = 1.95
  const circleShape = new THREE.Shape()
  circleShape.absarc(0, 0, circleRadius, 0, Math.PI * 2, false)

  const holePath = new THREE.Path()
  holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true)
  circleShape.holes.push(holePath)

  const extrudeSettings = {
    steps: 1,
    depth: 0.1,
    bevelEnabled: false
  }

  const circleGeometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings)
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
  const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial)

  circleMesh.position.z = z;

  scene.add(circleMesh)
}

/**
 *  設定圖形
 */
function setHoleImages(scene, z) {
  const circleRadius = 2

  const circleShape = new THREE.Shape()
  circleShape.absarc(0, 0, circleRadius, 0, Math.PI * 2, false)

  const imageIndex = randomSymbol(holeImages)
  const image = holeImages[imageIndex]

  // 設定三圓洞圖形
  if (image === IMAGE1) {
    const holeParams = [
      { radius: 0.7, x: 0.0000001, y: 1.1 },
      { radius: 0.7, x: -0.9, y: -0.65 },
      { radius: 0.7, x: 0.9, y: -0.65 }
    ]
    if (Array.isArray(holeParams)) {
      for (const hole of holeParams) {
        if (hole.radius && hole.x && hole.y) {
          const holePath = new THREE.Path();
          holePath.absarc(hole.x, hole.y, hole.radius, 0, Math.PI * 2, true);
          circleShape.holes.push(holePath);
        }
      }
    }
  }

  // 設定中間長方形
  if (image === IMAGE2) {
    const holeWidth = 2.5;
    const holeHeight = 1;
    const holeX = -holeWidth / 2;
    const holeY = -holeHeight / 2;
    const holePath = new THREE.Path();
    holePath.moveTo(holeX, holeY);
    holePath.lineTo(holeX + holeWidth, holeY);
    holePath.lineTo(holeX + holeWidth, holeY + holeHeight);
    holePath.lineTo(holeX, holeY + holeHeight);
    holePath.closePath();

    circleShape.holes.push(holePath)
  }

  // 設定中間洞
  if (image === IMAGE3) {
    const holePath = new THREE.Path().absarc(0, 0, 0.6, 0, Math.PI * 2, false)

    circleShape.holes.push(holePath)
  }

  if (image === IMAGE4) {}

  if (image === IMAGE5) {}

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: false,
  }

  const circleGeometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings)
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
  const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial)

  circleMesh.name = CROSS
  circleMesh.position.z = z;

  scene.add(circleMesh)
}

/**
 *  檢測碰撞
 */
function checkCameraCollision(camera, scene) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  scene.children.forEach(i => {
    raycaster.setFromCamera(mouse, camera);
    if (i.name === CROSS) {
      const intersects = raycaster.intersectObject(i)
      if (intersects.length > 0 && Number(camera.position.z.toFixed(0)) === i.position.z) {
        collision = true
        zAxisDecelerated(camera)
        missedArray.push(Number(camera.position.z.toFixed(0)))
        missedArray.filter(Boolean)
        missed = missedArray.length
        setTimeout(() => {
          collision = false
        }, delayCheckTime * 1000)
      }

      if (!intersects.length && Number(camera.position.z.toFixed(0)) === i.position.z) {
        passedArray.push(Number(camera.position.z.toFixed(0)))
        const newPassedArray = [...new Set(passedArray)]
        passed = newPassedArray.length
        getGameScore()
        accelerated()
      }
    }
  })
}

/**
 *  動畫 z 軸加速
 */
function zAxisAccelerate(camera) {
  camera.position.z -= animateSpeed
}

/**
 *  動畫 z 軸減速
 */
function zAxisDecelerated(camera) {
  camera.position.z += resetAnimateSpeed
  speed = resetSpeed
  animateSpeed = resetAnimateSpeed
  getGameSpeed()
}

/**
 *  動畫 x, y 軸加速
 */
function xyAxisMove(camera) {
  camera.position.x = cameraXPosition
  camera.position.y = cameraYPosition
}

/**
 *  動畫圖形旋轉
 */
function animateRotated(scene) {
  scene.children.forEach(i => {
    if (i.name === CROSS) {
      i.rotation.z += 0.01
    }
  })
}

/**
 *  動畫中空的洞
 */
function renderHollowCircle(scene) {
  setHollowCircle(scene, -5)
  for (let i = 0; i < 1000; i++) {
    setHollowCircle(scene, -15 - i * 10)
  }
}

/**
 *  初始化3D動畫
 */
function initAnimate() {
  // 場景設置
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer()

  // 場景渲染
  renderer.setSize( canvasWidth, canvasHeight )
  renderer.setClearColor(0x296FBA, 1)
  interfaceControl.appendChild( renderer.domElement )
  camera.position.set(cameraXPosition, cameraYPosition, cameraZPosition)
  collision = false
  speed = resetSpeed
  animateSpeed = 0.05

  // 中空的洞
  renderHollowCircle(scene)

  // 空洞圖形
  for (let i = 0; i < 1000; i++) {
    setHoleImages(scene, -10 - i * 10)
  }

  function animate() {
    if (!isGameInfo) return
    requestAnimationFrame(animate)
    xyAxisMove(camera)
    animateRotated(scene)
    checkCameraCollision(camera, scene)
    collision ? zAxisDecelerated(camera) : zAxisAccelerate(camera)
    renderer.render( scene, camera )
  }

  animate()
}

/**
 *  API
 */
fetch(`${url}/${id}/values/${sheet}?alt=json&key=${key}`)
  .then(res => res.json())
  .then(res => {
    userInfo.account = res.values[1][1]
    userInfo.password = res.values[1][2]
  })
