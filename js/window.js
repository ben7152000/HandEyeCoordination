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

/**
 * 禁止用調試工具
 */
const threshold = 160
const check = setInterval(function () {
  if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
    window.location.reload()
  }
}, 1000)
check()
