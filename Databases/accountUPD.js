function signOut() {
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
  localStorage.removeItem("profilePic");
  window.location.href = "Login.html";
}

function editprofilepicture() {
  const newUrl = prompt("Enter image URL for your profile picture:");
  if (newUrl) {
    const profilePic = document.getElementById("profile-pic");
    if (profilePic) profilePic.src = newUrl;
    localStorage.setItem("profilePic", newUrl);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const currentuser = localStorage.getItem("username");
  if (!currentuser) {
    window.location.href = "Login.html";
    return;
  }

  // Welcome message
  const welcomeMessage = document.getElementById("welcome-message");
  if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${currentuser}!`;

  // Username tag
  const usernamedisplay = document.getElementById("username");
  if (usernamedisplay) usernamedisplay.textContent = `@${currentuser}`;

  // Profile pic
  const profilePic = document.getElementById("profile-pic");
  if (profilePic) {
    const saved = localStorage.getItem("profilePic");
    profilePic.src = saved || `https://ui-avatars.com/api/?background=ff8c42&color=fff&size=128&name=${currentuser}`;
  }
});
