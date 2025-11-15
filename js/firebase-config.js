  // --- Toggle hiển thị mật khẩu ---
document.addEventListener("DOMContentLoaded", () => {
  const togglePass = document.getElementById("togglePass");
  const passwordInput = document.getElementById("pass");
  const eyeIcon = togglePass.querySelector("i");

  togglePass.addEventListener("click", () => {
    if(passwordInput.type === "password"){
      passwordInput.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  });
});
