var currentUID = null;
// nut toggle sidebar
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  mainContent.classList.toggle("sidebar-open");
});

// đóng sidebar khi click link 
document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
  });
});
// đóng sidebar khi click ra ngoài
document.addEventListener("click", (e) => {
  // kiểm tra click không phải trong sidebar và không phải nút toggle
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
  }
});


// Hàm hiển thị toast
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// Hàm hiển thị custom confirm modal
function showCustomConfirm(message, callback) {
  const modal = document.getElementById("customConfirm"); // Lấy modal
  const text = document.getElementById("confirmText");    // Lấy phần text
  const okBtn = document.getElementById("confirmOk");    // Lấy nút OK
  const cancelBtn = document.getElementById("confirmCancel"); // Lấy nút Hủy

  text.innerText = message;   // Gán nội dung confirm
  modal.style.display = "flex"; // Hiển thị modal

  okBtn.onclick = () => {     // Khi nhấn OK
    modal.style.display = "none"; // ẩn modal
    callback(true);               // gọi callback với giá trị true
  };

  cancelBtn.onclick = () => { // Khi nhấn Hủy
    modal.style.display = "none"; // ẩn modal
    callback(false);              // gọi callback với giá trị false
  };
}

// Chặn truy cập khi chưa login
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location = "login.html";
  } else {
    currentUID = user.uid;

    // Hiển thị tên từ Auth
    const nameSpans = document.querySelectorAll(".profile-info .name");
    // bắt đâu đỏi tên  
    if(nameSpans) nameSpans.forEach(span => span.innerText = user.displayName || "Người dùng");
    

// Đổi avatar
// --------------------
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");
const defaultAvatar = "./images/avt.png";
// Hiển thị avatar hiện tại nếu user có photoURL
if(user.photoURL){
  avatarImg.src = user.photoURL;
}else {
  avatarImg.src = defaultAvatar;
}
// Nếu ảnh từ Firebase load lỗi → dùng ảnh mặc định
avatarImg.onerror = () => {
  avatarImg.src = defaultAvatar;
};
// Khi bấm nút "Đổi avatar"
changeAvatarBtn.onclick = () => {
  avatarInput.click();
};

// Khi chọn file
avatarInput.onchange = async (e) => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = () => { avatarImg.src = reader.result; } // hiển thị ngay
  reader.readAsDataURL(file);

  try {
    const storageRef = firebase.storage().ref();
    const avatarRef = storageRef.child(`avatars/${currentUID}/${file.name}`);
    await avatarRef.put(file);
    const photoURL = await avatarRef.getDownloadURL();

    await firebase.auth().currentUser.updateProfile({ photoURL });
    showToast("Đổi avatar thành công!");
  } catch(err) {
    console.error(err);
    showToast("Lỗi khi đổi avatar: " + err.message, 5000);
  }
};



    // Lấy các phần tử đổi tên
    const nameInput = document.getElementById("nameInput");
    const editBtn   = document.getElementById("editNameBtn");
    const saveBtn   = document.getElementById("saveNameBtn");
    // Gán class cho các nút cố định
    saveBtn.className = "save-btn";
    document.getElementById("applyBreakBtn").className = "apply-btn";
    document.getElementById("applyGoBtn").className = "apply-btn";
    document.getElementById("applyBackBtn").className = "apply-btn";
    document.getElementById("logoutBtn").className = "logout-btn";

// Nút “Đổi tên”
  editBtn.onclick = () => {
  nameInput.style.display = "inline-block";
  saveBtn.style.display = "inline-block";
  nameInput.value = nameSpans[0].innerText; // Lấy tên hiện tại từ 1 span
  nameSpans.forEach(span => span.style.display = "none");
};

// Nút “Lưu tên”
saveBtn.onclick = () => {
  const newName = nameInput.value.trim();
  if(!newName) {
    showToast("Tên không được để trống!", 3000);
    return;
  }

  firebase.auth().currentUser.updateProfile({
    displayName: newName
  }).then(() => {
    nameSpans.forEach(span => span.innerText = newName);
    nameSpans.forEach(span => span.style.display = "inline-block");
    nameInput.style.display = "none";
    saveBtn.style.display = "none";
    showToast("Đổi tên thành công!"); // toast hiển thị giữa màn hình từ trên xuống
  }).catch(err => {
    console.error(err);
    showToast("Lỗi khi đổi tên: " + err.message, 5000);
  });
};
    

    generateTable();
  }
});


// Tạo list tháng
const monthSelect = document.getElementById('monthSelect');
for (let m = 1; m <= 12; m++) {
  let o = document.createElement("option");
  o.value = m;
  o.innerText = "Tháng " + m;
  monthSelect.appendChild(o);
}
monthSelect.value = new Date().getMonth() + 1;

// Convert giờ → sáng/chiều
function showPeriod(time) {
  if (!time) return "";
  let [h, m] = time.split(":");
  h = +h;
  return `${(h % 12) || 12}:${m} ${h < 12 ? "Sáng" : "Chiều"}`;
}

// Làm tròn giờ
function round(h, m) {
  if (m <= 14) return h;
  if (m <= 44) return h + 0.5;
  return h + 1;
}

// --------------------------
// Tạo bảng
// --------------------------
function generateTable() {
  const tbody = document.getElementById('timesheetBody');
  tbody.innerHTML = "";
  const month = monthSelect.value;
  document.getElementById("currentMonth").innerText = month;

  db.ref(`timesheet/${currentUID}/${month}`).once("value").then(snap => {
    const saved = snap.val() || {};

    for (let day = 1; day <= 31; day++) {
      const row = tbody.insertRow();
      row.insertCell().innerText = day;

      // Giờ vào
      const cIn = row.insertCell();
      const inputIn = document.createElement("input");
      inputIn.type = "time";
      inputIn.value = saved[day]?.in || "";
      const spIn = document.createElement("span");
      spIn.className = "period";
      spIn.innerText = showPeriod(inputIn.value);
      cIn.append(inputIn, spIn);

      // Giờ ra
      const cOut = row.insertCell();
      const inputOut = document.createElement("input");
      inputOut.type = "time";
      inputOut.value = saved[day]?.out || "";
      const spOut = document.createElement("span");
      spOut.className = "period";
      spOut.innerText = showPeriod(inputOut.value);
      cOut.append(inputOut, spOut);

      const cH = row.insertCell(); // Số giờ
      const cW = row.insertCell(); // Lương

      // Hành động
      const cActions = row.insertCell();
      cActions.style.display = "flex";
      cActions.style.gap = "5px";
      cActions.style.justifyContent = "center";
      cActions.style.alignItems = "center";

      // Nút reset giờ
      const btnReset = document.createElement("button");
      btnReset.innerText = "Xóa";
      btnReset.className = "reset-btn";
      btnReset.style.padding = "2px 6px";
      btnReset.style.fontSize = "12px";
      btnReset.style.cursor = "pointer";
      btnReset.onclick = () => {
        inputIn.value = "";
        inputOut.value = "";
        spIn.innerText = "";
        spOut.innerText = "";
        saveRow();
      };
      cActions.appendChild(btnReset);
// hỏi trc khi xóa giờ
            btnReset.onclick = () => {
  showCustomConfirm("Bạn có chắc chắn muốn xóa giờ này không?", confirmed => {
    if(!confirmed) return; // Hủy → dừng
    inputIn.value = "";
    inputOut.value = "";
    spIn.innerText = "";
    spOut.innerText = "";
    saveRow();
    showToast("Đã xóa giờ!");
  });
};

      // Nút thêm sub-row
      const btnAdd = document.createElement("button");
      btnAdd.innerText = "Thêm";
      btnAdd.className = "add-btn";
      btnAdd.style.padding = "2px 6px";
      btnAdd.style.fontSize = "12px";
      btnAdd.style.cursor = "pointer";
      btnAdd.onclick = async () => {
  const day = row.cells[0].innerText;
  const month = monthSelect.value;

  // Lấy subRows hiện tại từ Firebase
  const snap = await db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).once("value");
  const subRows = snap.val() || [];

  // Xóa các sub-row hiện tại trên DOM trước khi render lại
  let nextTr = row.nextElementSibling;
  while(nextTr && (nextTr.classList.contains("sub-row") || nextTr.classList.contains("sub-row-header"))) {
    const trToRemove = nextTr;
    nextTr = nextTr.nextElementSibling;
    trToRemove.remove();
  }

  // Hiển thị các subRows đã lưu
  subRows.forEach(sub => {
    const { inputs } = addSubRow(row);
    inputs[0].value = sub.break || "";
    inputs[1].value = sub.go || "";
    inputs[2].value = sub.back || "";
  });

  // Thêm 1 sub-row trống mới
  addSubRow(row);

  calc(); // tính lại tổng
};


      cActions.appendChild(btnAdd);

      // ----------------
      // Hàm save giờ vào/ra, giữ nguyên subRows cũ
      // ----------------
      function saveRow() {
        db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).once("value").then(subSnap => {
          const oldSubRows = subSnap.val() || [];
          db.ref(`timesheet/${currentUID}/${month}/${day}`).set({
            in: inputIn.value,
            out: inputOut.value,
            subRows: oldSubRows
          });
          calc();
        }).catch(err => {
          db.ref(`timesheet/${currentUID}/${month}/${day}`).set({
            in: inputIn.value,
            out: inputOut.value
          });
          calc();
        });
      }

inputIn.onchange = () => { 
  spIn.innerText = showPeriod(inputIn.value); 
  saveRow(); 
  calc(); // cập nhật lương ngay
};
inputOut.onchange = () => { 
  spOut.innerText = showPeriod(inputOut.value); 
  saveRow(); 
  calc(); // cập nhật lương ngay
};


      // ----------------
      // Nếu có subRows đã lưu → render
      // ----------------
if (saved[day]?.subRows && Array.isArray(saved[day].subRows)) {
  saved[day].subRows.forEach(sub => {
    const { inputTr, inputs } = addSubRow(row);
    inputs[0].value = sub.break || "";
    inputs[1].value = sub.go || "";
    inputs[2].value = sub.back || "";
  });
}


    } // end for day
    calc();
  });
}
// hàm nhập giá trí cố định
function applyFixed(type) {
  let typeName = type === "break" ? "Giờ giải lao" : type === "go" ? "Tiền đi" : "Tiền về";

  showCustomConfirm(`Có chắc muốn áp dụng tất cả ${typeName}?`, confirmed => {
    if(!confirmed) return;

    const month = monthSelect.value;
    if (!currentUID) return showToast("Chưa login!", 3000);

    let value = 0;
    if (type === "break") value = parseInt(document.getElementById("fixedBreak").value) || 0;
    if (type === "go")    value = parseFloat(document.getElementById("fixedGo").value) || 0;
    if (type === "back")  value = parseFloat(document.getElementById("fixedBack").value) || 0;

    for (let day = 1; day <= 31; day++) {
      db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).once("value").then(snap => {
        const subRows = snap.val() || [];
        if (subRows.length === 0) subRows.push({ break: "", go: "", back: "" });
        subRows.forEach(sr => { sr[type] = value; });
        db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).set(subRows);
      });
    }

    setTimeout(() => {
      generateTable();
      showToast(`${typeName} đã áp dụng cho toàn bộ tháng!`);
    }, 500); 
  });
}
// Hàm xóa giá trị cố định break/go/back
function clearFixed(type) {
  let typeName = type === "break" ? "Giờ giải lao" : type === "go" ? "Tiền đi" : "Tiền về";

  showCustomConfirm(`Có chắc muốn xóa tất cả ${typeName} cho toàn bộ tháng?`, confirmed => {
    if (!confirmed) return;

    const month = monthSelect.value;
    if (!currentUID) return showToast("Chưa login!", 3000);

    for (let day = 1; day <= 31; day++) {
      db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).once("value").then(snap => {
        const subRows = snap.val() || [];
        subRows.forEach(sr => sr[type] = ""); // xóa giá trị
        db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).set(subRows);
      });
    }

    setTimeout(() => {
      generateTable();
      showToast(`Đã xóa ${typeName} cho toàn bộ tháng!`);
    }, 300);
  });
}

// Gắn sự kiện cho các nút Xóa
document.getElementById("clearBreakBtn").onclick = () => clearFixed("break");
document.getElementById("clearGoBtn").onclick    = () => clearFixed("go");
document.getElementById("clearBackBtn").onclick  = () => clearFixed("back");

// hàm nhập giờ cố định giờ vào/ra
function applyFixedInOut(type) {
  let label = type === "in" ? "Giờ vào" : "Giờ ra";

  showCustomConfirm(`Có chắc muốn áp dụng tất cả ${label} cho toàn bộ tháng?`, confirmed => {
    if (!confirmed) return;

    const month = monthSelect.value;
    if (!currentUID) return showToast("Chưa login!", 3000);

    const value = document.getElementById(type === "in" ? "fixedIn" : "fixedOut").value;

    if (!value) {
      return showToast(`Bạn chưa nhập ${label}!`);
    }

    // Áp dụng cho toàn bộ ngày trong tháng
    for (let day = 1; day <= 31; day++) {
      db.ref(`timesheet/${currentUID}/${month}/${day}`).once("value").then(snap => {
        const old = snap.val() || { subRows: [] };

        db.ref(`timesheet/${currentUID}/${month}/${day}`).set({
          in:  type === "in" ? value : old.in || "",
          out: type === "out" ? value : old.out || "",
          subRows: old.subRows || []
        });
      });
    }

    setTimeout(() => {
      generateTable();
      showToast(`${label} đã áp dụng cho toàn bộ tháng!`);
    }, 300);
  });
}

// Hàm xóa giờ vào/ra cố định
function clearFixedInOut(type) {
  let label = type === "in" ? "Giờ vào" : "Giờ ra";

  showCustomConfirm(`Có chắc muốn xóa tất cả ${label} cho toàn bộ tháng?`, confirmed => {
    if (!confirmed) return;

    const month = monthSelect.value;
    if (!currentUID) return showToast("Chưa login!", 3000);

    for (let day = 1; day <= 31; day++) {
      db.ref(`timesheet/${currentUID}/${month}/${day}`).once("value").then(snap => {
        const old = snap.val() || { subRows: [] };

        db.ref(`timesheet/${currentUID}/${month}/${day}`).set({
          in: type === "in" ? "" : old.in || "",
          out: type === "out" ? "" : old.out || "",
          subRows: old.subRows || []
        });
      });
    }

    setTimeout(() => {
      generateTable();
      showToast(`Đã xóa ${label} cho toàn bộ tháng!`);
    }, 300);
  });
}

// Gắn sự kiện cho nút xóa
document.getElementById("clearInBtn").onclick = () => clearFixedInOut("in");
document.getElementById("clearOutBtn").onclick = () => clearFixedInOut("out");




// Gắn sự kiện cho từng nút riêng
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("applyInBtn").onclick = () => applyFixedInOut("in");
  document.getElementById("applyOutBtn").onclick = () => applyFixedInOut("out");
  document.getElementById("applyBreakBtn").onclick = () => applyFixed("break");
  document.getElementById("applyGoBtn").onclick    = () => applyFixed("go");
  document.getElementById("applyBackBtn").onclick  = () => applyFixed("back");
});

// --------------------------
// Hàm thêm sub-row
// --------------------------
function addSubRow(mainTr, existingData = null) {
  const tbody = mainTr.parentElement;

  const headerTr = document.createElement("tr");
  headerTr.className = "sub-row-header";
  headerTr.style.background = "#f0f0f0";
  headerTr.style.fontWeight = "bold";

  const tdBreakHeader = document.createElement("td");
  tdBreakHeader.innerText = "Giờ giải lao";
  headerTr.appendChild(tdBreakHeader);

  const tdGoHeader = document.createElement("td");
  tdGoHeader.colSpan = 2;
  tdGoHeader.innerText = "Tiền đi";
  headerTr.appendChild(tdGoHeader);

  const tdBackHeader = document.createElement("td");
  tdBackHeader.colSpan = 2;
  tdBackHeader.innerText = "Tiền về";
  headerTr.appendChild(tdBackHeader);

  const tdActionHeader = document.createElement("td");
  tdActionHeader.innerText = "Hành động";
  headerTr.appendChild(tdActionHeader);

  const inputTr = document.createElement("tr");
  inputTr.className = "sub-row";

  const tdBreak = document.createElement("td");
  const inputBreak = document.createElement("input");
  inputBreak.type = "number";
  inputBreak.min = 1;
  inputBreak.max = 1440;
  inputBreak.placeholder = "Phút";
  tdBreak.appendChild(inputBreak);
  inputTr.appendChild(tdBreak);

  const tdGo = document.createElement("td");
  tdGo.colSpan = 2;
  const inputGo = document.createElement("input");
  inputGo.type = "number";
  inputGo.placeholder = "Tiền đi";
  tdGo.appendChild(inputGo);
  inputTr.appendChild(tdGo);

  const tdBack = document.createElement("td");
  tdBack.colSpan = 2;
  const inputBack = document.createElement("input");
  inputBack.type = "number";
  inputBack.placeholder = "Tiền về";
  tdBack.appendChild(inputBack);
  inputTr.appendChild(tdBack);

  const tdAction = document.createElement("td");

  // Nút Xóa luôn hiện
  const btnDel = document.createElement("button");
  btnDel.innerText = "Xóa";
  btnDel.className = "delete-btn";
  btnDel.style.padding = "2px 6px";
  btnDel.style.fontSize = "12px";
  btnDel.style.cursor = "pointer";
  btnDel.onclick = () => {
    headerTr.remove();
    inputTr.remove();
    saveSubRow(mainTr);
    calc(); // <--  cập nhật lương ngay
  };
  tdAction.appendChild(btnDel);
  // hỏi trc khi xóa hàng phụ
  btnDel.onclick = () => {
  showCustomConfirm("Bạn có chắc chắn muốn xóa hàng này không?", confirmed => {
    if(!confirmed) return; // Hủy → dừng
    headerTr.remove();
    inputTr.remove();
    saveSubRow(mainTr);
    calc();
    showToast("Đã xóa hàng!");
  });
};


  // Nút Ẩn, hiển thị chỉ khi có dữ liệu
  const btnHide = document.createElement("button");
  btnHide.innerText = "Ẩn";
  btnHide.className = "hide-btn";
  btnHide.style.padding = "2px 6px";
  btnHide.style.fontSize = "12px";
  btnHide.style.cursor = "pointer";
  btnHide.style.marginLeft = "5px";
  btnHide.style.display = "none"; // ẩn mặc định
  btnHide.onclick = () => {
    headerTr.style.display = "none";
    inputTr.style.display = "none";
  };
  tdAction.appendChild(btnHide);

  inputTr.appendChild(tdAction);

  // Chèn DOM
  mainTr.after(inputTr);
  inputTr.before(headerTr);

  // Nếu có dữ liệu đã tồn tại → gán giá trị và hiện nút Ẩn
  if (existingData) {
    inputBreak.value = existingData.break || "";
    inputGo.value = existingData.go || "";
    inputBack.value = existingData.back || "";
    if (inputBreak.value || inputGo.value || inputBack.value) {
      btnHide.style.display = "inline-block";
    }
  }

  // Gắn onchange để lưu sub-row và hiển thị nút Ẩn nếu nhập dữ liệu
[inputBreak, inputGo, inputBack].forEach(inp => {
  inp.oninput = () => { // dùng oninput để cập nhật ngay khi gõ
    saveSubRow(mainTr);
    calc(); // cập nhật lương ngay
    if (inputBreak.value || inputGo.value || inputBack.value) {
      btnHide.style.display = "inline-block";
    } else {
      btnHide.style.display = "none";
    }
  };
});


  return { headerTr, inputTr, inputs: [inputBreak, inputGo, inputBack] };
}


// --------------------------
// Hàm lưu sub-row
// --------------------------
function saveSubRow(mainTr) {
  const day = mainTr.cells[0].innerText;
  const month = monthSelect.value;

  const subRowsData = [];
  let nextTr = mainTr.nextElementSibling;

  while(nextTr) {
    if(nextTr.classList.contains("sub-row")) {
      const inputs = nextTr.querySelectorAll("input");
      subRowsData.push({
        break: inputs[0]?.value || "",
        go:    inputs[1]?.value || "",
        back:  inputs[2]?.value || ""
      });
    }
    // Nếu gặp hàng không phải sub-row, dừng vòng lặp
    else if(!nextTr.classList.contains("sub-row-header")) break;

    nextTr = nextTr.nextElementSibling;
  }

  db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`)
    .set(subRowsData)
    .then(() => console.log("Lưu sub-row thành công!", subRowsData))
    .catch(err => console.error(err));
}



// --------------------------
// Hàm tính giờ & lương
// --------------------------
function calc() {
  let total = 0;
  const rate = +document.getElementById("rate").value;
  const rows = [...document.querySelectorAll("#timesheetBody tr")];

  rows.forEach(r => {
    if (r.classList.contains("sub-row") || r.classList.contains("sub-row-header")) return;

    const inputIn = r.cells[1]?.querySelector("input")?.value || "";
    const inputOut = r.cells[2]?.querySelector("input")?.value || "";
    const cHours = r.cells[3];
    const cWage = r.cells[4];

    if (inputIn && inputOut) {
      let [ih, im] = inputIn.split(":").map(Number);
      let [oh, om] = inputOut.split(":").map(Number);

      let h = oh - ih;
      let m = om - im;
      if (m < 0) { h--; m += 60; }
      if (h < 0) { h = 0; m = 0; }

      let totalHours = h + m / 60;

      // Tính giờ giải lao và tiền đi/tiền về
      let breakHours = 0;
      let subMoney = 0;
      let nextTr = r.nextElementSibling;

      while(nextTr && (nextTr.classList.contains("sub-row") || nextTr.classList.contains("sub-row-header"))) {
        if(nextTr.classList.contains("sub-row")){
          const inputs = nextTr.querySelectorAll("input");
          const breakInput = parseInt(inputs[0]?.value) || 0; // phút
          const goInput = parseFloat(inputs[1]?.value) || 0;
          const backInput = parseFloat(inputs[2]?.value) || 0;

          breakHours += breakInput / 60; // phút → giờ
          subMoney += goInput + backInput;
        }
        nextTr = nextTr.nextElementSibling;
      }

      // Giờ thực tế trừ giờ giải lao
      const realHours = Math.max(totalHours - breakHours, 0);
      const wageByHour = Math.round(realHours * rate);

      // Tổng lương = lương giờ + tiền đi về
      const wage = wageByHour + subMoney;

      cHours.innerText = realHours.toFixed(2);
      cWage.innerText = wage.toLocaleString();

      total += wage;
    } else {
      cHours.innerText = "";
      cWage.innerText = "";
    }
  });

  document.getElementById("total").innerText = total.toLocaleString();
  document.getElementById("floatingTotalValue").innerText = total.toLocaleString();
}
// nút cuộn lên đầu trang
const scrollBtn = document.getElementById("scrollTopBtn");

// Hiển thị nút khi cuộn xuống > 100px
window.onscroll = () => {
  scrollBtn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
};

// Khi click → cuộn lên đầu trang
scrollBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};




monthSelect.onchange = generateTable;
document.getElementById("rate").onchange = calc;

document.getElementById("logoutBtn").addEventListener("click", () => {
  // Gọi modal xác nhận
  showCustomConfirm("Bạn có chắc muốn đăng xuất không?", confirmed => {
    if(confirmed){ // Nếu nhấn OK
      firebase.auth().signOut()
        .then(() => window.location = "login.html") // Đăng xuất
        .catch(err => alert("Lỗi khi đăng xuất: " + err.message));
    }
    // Nếu nhấn Hủy → không làm gì
  });
});

