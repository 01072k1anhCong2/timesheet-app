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