  function editprofilepicture() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        const profilePic = document.getElementById("profile-pic");
        if (profilePic) profilePic.src = imageData;
        localStorage.setItem("profilePic", imageData);
      };
      reader.readAsDataURL(file);
    });

    input.click();
  }

  // Restore saved profile pic on load
  document.addEventListener("DOMContentLoaded", () => {
    const savedPic = localStorage.getItem("profilePic");
    const profilePic = document.getElementById("profile-pic");
    if (savedPic && profilePic) {
      profilePic.src = savedPic;
    }
  });