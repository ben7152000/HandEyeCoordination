/**
 * 禁止用F12
 */
window.onkeydown = window.onkeyup = window.onkeypress = function (e) {
  if (e.keyCode === 123) {
    e.preventDefault()
    window.event.returnValue = false
  }
}

/**
 * 禁止右鍵
 */
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});
