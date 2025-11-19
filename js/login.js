// ============================================
// Quản lý đăng nhập & reset mật khẩu
// ============================================

// --- Các phần tử DOM chính ---
const loginBtn = document.getElementById("loginBtn");
const loginForm = document.querySelector(".login-form");
const resetForm = document.getElementById("resetForm");
const forgotBtn = document.getElementById("forgotBtn");
const titleH3 = document.querySelector("h3");
const backToLoginBtn = document.getElementById("backToLoginBtn");
const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("pass");
const eyeIcon = togglePass.querySelector("i");

// --- Hàm đăng nhập ---
loginBtn.addEventListener("click", () =>  {
  const email = document.getElementById("email").value;
  const pass  = document.getElementById("pass").value;
  const box = document.querySelector(".box");
  const msg = document.getElementById("msg");

  // Reset trạng thái hiển thị
  box.classList.remove("success", "error");
  msg.innerText = "";

  // Firebase: đăng nhập với email & password
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      box.classList.add("success");
      msg.innerText = "Đăng nhập thành công!";
      setTimeout(() => {
        window.location = "index.html";
      }, 800);
    })
    .catch(err => {
      box.classList.add("error");
      msg.innerText = "Sai email hoặc mật khẩu rồi má ơi!";
    });
}
);

// --- Hiển thị form reset khi bấm "Quên mật khẩu" ---
forgotBtn.onclick = (e) => {
  e.preventDefault();
  loginForm.style.display = "none";   // ẩn form login
  resetForm.style.display = "block";  // hiện form reset
  forgotBtn.style.display = "none";   // ẩn link forgot
  titleH3.innerText = "Cấp lại mật khẩu"; // đổi tiêu đề

  document.getElementById("msg").innerText = ""; // xóa thông báo
};

// --- Gửi email reset mật khẩu ---
document.getElementById("sendResetBtn").onclick = () => {
  const email = document.getElementById("resetEmail").value;
  const msg = document.getElementById("msg");
  const sendBtn = document.getElementById("sendResetBtn");
  
  sendBtn.innerText = "Đang gửi...";

  // Nếu chưa nhập email
  if(!email) {
    msg.innerText = "Vui lòng nhập email để lấy lại mật khẩu!";
    resetForm.style.display = "none";
    loginForm.style.display = "block";
    forgotBtn.style.display = "block";
    sendBtn.innerText = "Gửi";
    titleH3.innerText = "Đăng nhập";
    return;
  }

  // Firebase: gửi email reset
  auth.sendPasswordResetEmail(email)
    .then(() => {
      msg.innerText = "Email lấy lại mật khẩu đã được gửi. Kiểm tra hộp thư của bạn!";
    })
    .catch(err => {
      console.error(err);
      // Xử lý thông báo tiếng Việt theo lỗi Firebase
      if(err.code === "auth/too-many-requests") {
        msg.innerText = "Thiết bị của bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ vài phút và thử lại!";
      } else if(err.code === "auth/user-not-found") {
        msg.innerText = "Email này chưa được đăng ký!";
      } else if(err.code === "auth/invalid-email") {
        msg.innerText = "Email không hợp lệ, vui lòng kiểm tra lại!";
      } else {
        msg.innerText = "Lỗi khi gửi email: " + err.message;
      }
    })
    .finally(() => {
      resetForm.style.display = "none";
      loginForm.style.display = "block";
      document.getElementById("resetEmail").value = "";
      sendBtn.innerText = "Gửi";
    });
};

// --- Nút trở lại login ---
backToLoginBtn.addEventListener("click", () => {
  resetForm.style.display = "none";   // ẩn form reset
  loginForm.style.display = "block";  // hiện form login
  forgotBtn.style.display = "block";  // hiện link quên mật khẩu
  titleH3.innerText = "Đăng nhập";    // đổi tiêu đề
  document.getElementById("msg").innerText = ""; // xóa thông báo
});

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
