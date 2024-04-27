/**
 * 禁止用F12
 */
window.onkeydown = window.onkeyup = window.onkeypress = (e) => {
  if (e.keyCode === 123) {
    e.preventDefault()
    window.event.returnValue = false
  }
}

/**
 * 禁止右鍵
 */
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

/**
 * 啟動動畫
 */
document.addEventListener('DOMContentLoaded', () => {
  const startupAnimation = document.querySelector('.startup-animation')
  const logo = document.querySelector('.logo')
  const loginInfo = document.querySelector('.login-info')

  setTimeout(() => {
    startupAnimation.style.transform = "translate(-50%, -50%) scale(0.7)";
  }, 2000);

  startupAnimation.addEventListener("transitionend", function () {
    startupAnimation.classList.add("hidden");
    logo.style.display = 'block'
    loginInfo.style.display = 'flex'
  });
})
