
const loginForm = document.querySelector(".login-form");
const resetForm = document.getElementById("resetForm");

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
  document.getElementById("msg").innerText = "";
};

// Nút gửi email reset
document.getElementById("sendResetBtn").onclick = () => {
  let email = document.getElementById("resetEmail").value;
  let msg = document.getElementById("msg");

  if(!email) {
    msg.innerText = "Vui lòng nhập email để lấy lại mật khẩu!";
    resetForm.style.display = "none";
    loginForm.style.display = "block";
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

// Lấy các phần tử
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");

// Khi bấm "Đổi avatar" → mở file picker
changeAvatarBtn.onclick = () => {
  avatarInput.click();
};

// Khi chọn file
avatarInput.onchange = async (e) => {
  const file = e.target.files[0];
  if(!file) return;

  // Hiển thị tạm ảnh đã chọn
  const reader = new FileReader();
  reader.onload = () => {
    avatarImg.src = reader.result;
  }
  reader.readAsDataURL(file);

  try {
    // Upload lên Firebase Storage
    const storageRef = firebase.storage().ref();
    const avatarRef = storageRef.child(`avatars/${currentUID}/${file.name}`);
    await avatarRef.put(file);

    // Lấy URL và cập nhật user
    const photoURL = await avatarRef.getDownloadURL();
    await firebase.auth().currentUser.updateProfile({ photoURL });

    showToast("Đổi avatar thành công!");
  } catch(err) {
    console.error(err);
    showToast("Lỗi khi đổi avatar: " + err.message, 5000);
  }
};

// Khi load trang → hiển thị avatar hiện tại
firebase.auth().onAuthStateChanged(user => {
  if(user && user.photoURL){
    avatarImg.src = user.photoURL;
  }
});
