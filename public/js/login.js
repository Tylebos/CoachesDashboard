
/**
 * Event: Load the login page
 * Action: 
 *      Reset the login form to its default
 */
window.addEventListener('load', () => {
    document.getElementById("login-form").reset();
});


/**
 * Event: successful login
 * Action:
 *      Login form disappears and a welcome coach message appears
 */
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Fake login success for demo
  const form = e.target;
  const welcome = document.getElementById("login-welcome");

  // Animate form out
  form.style.animation = "fadeOutUp 0.8s forwards";

  // After animation, show welcome message
  setTimeout(() => {
    form.reset();
    form.style.display = "none";
    welcome.style.display = "block";
    welcome.style.animation = "fadeInUp 0.8s forwards";
  }, 800); // match animation duration
});