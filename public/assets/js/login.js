/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * File: login.js
 * Description:
 *       Front-end Javascript for logging into the page.
 * github: Tylebos
 */

/**
 * Event: Load the login page
 * Action: 
 *      Reset the login form to its default
 */
window.addEventListener('load', () => {
    document.getElementById("login-form").reset();
});


async function login() {
  const loginID = document.getElementById("loginID").value;
  const password = document.getElementById("password").value;

  if (!loginID || !password) {
    alert('Please fill out all fields');
    return;
  }

  console.log("Submitting login:", loginID);

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginID, password })
    });

    console.log("Response status:", res.status);

    const data = await res.json();
    console.log("Response data:", data);

    if (!res.ok) {
      alert(data.message || 'Login failed');
      return;
    }

    console.log("Storing JWT and user info...");
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('userID', data.userID);
    localStorage.setItem('teamID', data.teamID);
    localStorage.setItem('userRole', data.userRole);

    console.log("Stored:", localStorage.getItem('accessToken'));

    // Animation
    const form = document.getElementById("login-form");
    const welcome = document.getElementById("login-welcome");
    form.style.animation = "fadeOutUp 0.8s forwards";

    setTimeout(() => {
      form.reset();
      form.style.display = "none";
      welcome.style.display = "block";
      welcome.style.animation = "fadeInUp 0.8s forwards";
    }, 1000);

    setTimeout(() => {
      window.location.href = '/home'
    }, 3000);

  } catch (error) {
    console.error("Login failed:", error);
    alert('Something went wrong during login.');
  }
}

/**
 * Event: successful login
 * Action:
 *      Login form disappears and a welcome coach message appears
 */
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  login();
});
