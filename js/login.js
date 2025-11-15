
const loginForm = document.querySelector(".login-form");
const resetForm = document.getElementById("resetForm");
const forgotBtn = document.getElementById("forgotBtn");
const titleH3 = document.querySelector("h3"); 
function login(){
  let email = document.getElementById("email").value;
  let pass  = document.getElementById("pass").value;
  let box = document.querySelector(".box");
  let msg = document.getElementById("msg");

  box.classList.remove("success", "error");
  msg.innerText = "";

  auth.signInWithEmailAndPassword(email, pass)
  .then(() => {
    box.classList.add("success");
    msg.innerText = "Đăng nhập thành công!";
    setTimeout(()=> { window.location = "index.html"; }, 800);
  })
  .catch(err => {
    box.classList.add("error");
    msg.innerText = "Sai email hoặc mật khẩu rồi má ơi!";
  });
}
//  laay lai mat khau
// Hiện form reset khi bấm forgot
document.getElementById("forgotBtn").onclick = (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  resetForm.style.display = "block";
  forgotBtn.style.display = "none";
  titleH3.innerText = "Cấp lại mật khẩu";
  document.getElementById("msg").innerText = "";
};

// Nút gửi email reset
document.getElementById("sendResetBtn").onclick = () => {
  let email = document.getElementById("resetEmail").value;
  let msg = document.getElementById("msg");
  document.getElementById("sendResetBtn").innerText = "Đang gửi...";

  if(!email) {
    msg.innerText = "Vui lòng nhập email để lấy lại mật khẩu!";
    resetForm.style.display = "none";
    loginForm.style.display = "block";
    forgotBtn.style.display = "block";
    document.getElementById("sendResetBtn").innerText = "Gửi";
    titleH3.innerText = "Đăng nhập";
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      msg.innerText = "Email lấy lại mật khẩu đã được gửi. Kiểm tra hộp thư của bạn!";
    })
    .catch(err => {
      console.error(err);
      // Hiển thị thông báo tiếng Việt dựa vào lỗi Firebase
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
    });
};
const backToLoginBtn = document.getElementById("backToLoginBtn");
// trở lại đăng nhập
backToLoginBtn.addEventListener("click", () => {
  resetForm.style.display = "none";   // ẩn form reset
  loginForm.style.display = "block";  // hiện form login
  forgotBtn.style.display = "block"; // hiện link quên mật khẩu
  titleH3.innerText = "Đăng nhập";    // đổi tiêu đề
  document.getElementById("msg").innerText = ""; // xóa thông báo
});
