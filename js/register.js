function register() {
  let name  = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value;
  let pass  = document.getElementById("pass").value;
  let box   = document.querySelector(".box");
  let msg   = document.getElementById("msg");

  box.classList.remove("success","error");
  msg.innerText = "";

  if(!name) {
    box.classList.add("error");
    msg.innerText = "Vui lòng nhập họ tên!";
    return;
  }

  auth.createUserWithEmailAndPassword(email, pass)
    .then(userCredential => {
      // Lưu tên vào profile Firebase Auth
      return userCredential.user.updateProfile({ displayName: name });
    })
    .then(() => {
      box.classList.add("success");
      msg.innerText = "Đăng ký thành công!";
      setTimeout(() => { window.location = "login.html"; }, 1000);
    })
    .catch(err => {
      box.classList.add("error");
      let message = "";
      switch(err.code){
        case "auth/weak-password": message = "Mật khẩu phải ít nhất 6 ký tự!"; break;
        case "auth/email-already-in-use": message = "Email đã được đăng ký!"; break;
        case "auth/invalid-email": message = "Email không hợp lệ!"; break;
        default: message = "Lỗi: " + err.message;
      }
      msg.innerText = message;
    });
}
  // --- Toggle hiển thị mật khẩu ---

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
