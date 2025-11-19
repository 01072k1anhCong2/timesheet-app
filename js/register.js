// ============================================
//  Quản lý đăng ký tài khoản
// ============================================

// --- Các phần tử DOM chính ---
const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("pass");
const eyeIcon = togglePass.querySelector("i");

// --- Hàm đăng ký ---
function register() {
  const name  = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value;
  const pass  = document.getElementById("pass").value;
  const box   = document.querySelector(".box");
  const msg   = document.getElementById("msg");

  // Reset trạng thái hiển thị
  box.classList.remove("success", "error");
  msg.innerText = "";

  // Kiểm tra nhập tên
  if(!name) {
    box.classList.add("error");
    msg.innerText = "Vui lòng nhập họ tên!";
    return;
  }

  // Firebase: tạo tài khoản với email & password
  auth.createUserWithEmailAndPassword(email, pass)
    .then(userCredential => {
      // Lưu tên vào profile Firebase Auth
      return userCredential.user.updateProfile({ displayName: name });
    })
    .then(() => {
      box.classList.add("success");
      msg.innerText = "Đăng ký thành công!";
      setTimeout(() => {
        window.location = "login.html";
      }, 1000);
    })
    .catch(err => {
      box.classList.add("error");
      let message = "";
      switch(err.code){
        case "auth/weak-password":
          message = "Mật khẩu phải ít nhất 6 ký tự!";
          break;
        case "auth/email-already-in-use":
          message = "Email đã được đăng ký!";
          break;
        case "auth/invalid-email":
          message = "Email không hợp lệ!";
          break;
        default:
          message = "Lỗi: " + err.message;
      }
      msg.innerText = message;
    });
}

// --- Toggle hiển thị mật khẩu ---
togglePass.addEventListener("click", () => {
  if(passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
});
