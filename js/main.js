import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js'
import {
  creatTimer,
  getRandomColorPairs,
  hidePlayAgainButton,
  setTimerText,
  showPlayAgainButton,
} from './utils.js'
import {
  getColorElementList,
  getColorListElement,
  getInActiveColorList,
  getPlayAgainButton,
} from './selectors.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING
let timer = creatTimer({
  seconds: GAME_TIME,
  onChange: handleTimerChange,
  onFinish: handleTimerFinish,
})

function handleTimerChange(second) {
  const fullSecond = `0${second}s`.slice(-3)
  setTimerText(fullSecond)
}

function handleTimerFinish() {
  //endgame
  gameStatus = GAME_STATUS.FINISHED
  setTimerText('GAME OVER!')
}

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

function handleColorClick(liElement) {
  const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
  const isClicked = liElement.classList.contains('active')
  if (!liElement || shouldBlockClick || isClicked) return
  liElement.classList.add('active')

  //save clicked cell to selections
  selections.push(liElement)
  if (selections.length < 2) return

  //check match
  const firstColor = selections[0].dataset.color
  const secondColor = selections[1].dataset.color
  const isMatch = firstColor === secondColor

  if (isMatch) {
    //check win
    const isWin = getInActiveColorList().length === 0
    if (isWin) {
      //show replay
      showPlayAgainButton()
      //show You WIN
      setTimerText('YOU WIN!')
      gameStatus = GAME_STATUS.FINISHED
      timer.clear()
    }
    selections = []
    return
  }

  //in case of not match
  //remove active class for 2 li elements
  gameStatus = GAME_STATUS.BLOCKING

  setTimeout(() => {
    selections[0].classList.remove('active')
    selections[1].classList.remove('active')
    selections = []

    if (gameStatus !== GAME_STATUS.FINISHED) gameStatus = GAME_STATUS.PLAYING
  }, 200)
}

function initColors() {
  //random 8 pairs of colors
  const colorList = getRandomColorPairs(PAIRS_COUNT)

  //bind to li > div.overlay
  const liList = getColorElementList()

  liList.forEach((liElement, index) => {
    liElement.dataset.color = colorList[index]

    const overlayElement = liElement.querySelector('.overlay')
    if (overlayElement) overlayElement.style.backgroundColor = colorList[index]
  })
}

function attachEventForColorList() {
  const ulElement = getColorListElement()
  if (!ulElement) return

  //event delegation
  ulElement.addEventListener('click', (event) => {
    if (event.target.tagName != 'LI') return

    handleColorClick(event.target)
  })
}

function resetGame() {
  // reset global vars
  gameStatus = GAME_STATUS.PLAYING
  selections = []

  // reset DOM elements
  const colorElementList = getColorElementList()
  for (const colorElement of colorElementList) {
    colorElement.classList.remove('active')
  }

  hidePlayAgainButton()
  setTimerText('')
  initColors()

  startTimer()
}

function attachEventForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (!playAgainButton) return

  playAgainButton.addEventListener('click', resetGame)
}

function startTimer() {
  timer.start()
}

//main
;(() => {
  initColors()
  attachEventForColorList()
  attachEventForPlayAgainButton()
  startTimer()
})()
