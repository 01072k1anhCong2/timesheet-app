/* ============================================================
   timesheet-app: index.js (phiên bản comment tiếng Việt)
   - Mục tiêu: giữ nguyên logic gốc, chỉ tái cấu trúc & comment tiếng Việt
   ============================================================ */

/* ============================
   BIẾN TOÀN CỤC / THAM CHIẾU DOM
   ============================ */
var currentUID = null;

// Sidebar / bố cục chính
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

// Toast / Modal xác nhận tùy chỉnh
const toastEl = document.getElementById("toast");
const customConfirmModal = document.getElementById("customConfirm");
const confirmTextEl = document.getElementById("confirmText");
const confirmOkBtn = document.getElementById("confirmOk");
const confirmCancelBtn = document.getElementById("confirmCancel");

// Điều khiển thông tin người dùng
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");
const nameInput = document.getElementById("nameInput");
const editNameBtn = document.getElementById("editNameBtn");
const saveNameBtn = document.getElementById("saveNameBtn");

// Các điều khiển giá trị cố định
const monthSelect = document.getElementById('monthSelect');
const rateInput = document.getElementById("rate");

// Bảng & tổng lương
const timesheetBody = document.getElementById('timesheetBody');
const currentMonthLabel = document.getElementById("currentMonth");
const totalLabel = document.getElementById("total");
const floatingTotalValue = document.getElementById("floatingTotalValue");

// Nút cuộn lên đầu trang
const scrollBtn = document.getElementById("scrollTopBtn");

// Các nút áp dụng / xóa giá trị cố định
const applyBreakBtn = document.getElementById("applyBreakBtn");
const applyGoBtn = document.getElementById("applyGoBtn");
const applyBackBtn = document.getElementById("applyBackBtn");
const applyInBtn = document.getElementById("applyInBtn");
const applyOutBtn = document.getElementById("applyOutBtn");
const clearBreakBtn = document.getElementById("clearBreakBtn");
const clearGoBtn = document.getElementById("clearGoBtn");
const clearBackBtn = document.getElementById("clearBackBtn");
const clearInBtn = document.getElementById("clearInBtn");
const clearOutBtn = document.getElementById("clearOutBtn");

// Ảnh đại diện mặc định nếu người dùng không có photoURL
const defaultAvatar = "./images/avt.png";

/* ============================
   UI: Điều khiển sidebar & hành vi đóng mở
   ============================ */

// Toggle (mở/đóng) sidebar khi click menuToggle
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  mainContent.classList.toggle("sidebar-open");
});

// Đóng sidebar khi click vào một liên kết trong sidebar
document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
  });
});

// Đóng sidebar khi click ra ngoài sidebar và không phải là nút toggle
document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
  }
});


/* ============================
   UI: Toast & Modal xác nhận tùy chỉnh
   ============================ */

// Hiển thị toast với thông điệp và thời gian (ms)
function showToast(message, duration = 3000) {
  const toast = toastEl;
  if (!toast) {
    console.warn("Không tìm thấy phần tử toast");
    return;
  }
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// Hiển thị modal xác nhận tùy chỉnh, callback nhận true nếu OK, false nếu Hủy
function showCustomConfirm(message, callback) {
  const modal = customConfirmModal;
  const text = confirmTextEl;
  const okBtn = confirmOkBtn;
  const cancelBtn = confirmCancelBtn;

  if (!modal || !text || !okBtn || !cancelBtn) {
    // Nếu phần tử thiếu → fallback dùng confirm mặc định
    const result = confirm(message);
    callback(result);
    return;
  }

  text.innerText = message;
  modal.style.display = "flex";

  okBtn.onclick = () => {
    modal.style.display = "none";
    callback(true);
  };

  cancelBtn.onclick = () => {
    modal.style.display = "none";
    callback(false);
  };
}


/* ============================
   AUTH: Kiểm tra đăng nhập & khởi tạo giao diện người dùng
   ============================ */

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // Nếu chưa đăng nhập → chuyển về trang login
    window.location = "login.html";
    return;
  }

  // Người dùng đã đăng nhập
  currentUID = user.uid;

  // Hiển thị tên người dùng nếu có
  const nameSpans = document.querySelectorAll(".profile-info .name");
  if (nameSpans) nameSpans.forEach(span => span.innerText = user.displayName || "Người dùng");

  // --- Xử lý avatar ---
  avatarImg.src = user.photoURL || defaultAvatar;
  avatarImg.onerror = () => { avatarImg.src = defaultAvatar; };

  changeAvatarBtn.onclick = () => {
    avatarInput.click();
  };

  avatarInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Hiển thị ảnh xem trước
    const reader = new FileReader();
    reader.onload = () => { avatarImg.src = reader.result; };
    reader.readAsDataURL(file);

    try {
      const storageRef = firebase.storage().ref();
      const avatarRef = storageRef.child(`avatars/${currentUID}/${file.name}`);
      await avatarRef.put(file);
      const photoURL = await avatarRef.getDownloadURL();

      await firebase.auth().currentUser.updateProfile({ photoURL });
      showToast("Đổi avatar thành công!");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi đổi avatar: " + err.message, 5000);
    }
  };

  // --- Xử lý đổi tên người dùng ---
  if (saveNameBtn) saveNameBtn.className = "save-btn";
  if (applyBreakBtn) applyBreakBtn.className = "apply-btn";
  if (applyGoBtn) applyGoBtn.className = "apply-btn";
  if (applyBackBtn) applyBackBtn.className = "apply-btn";
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.className = "logout-btn";

  editNameBtn.onclick = () => {
    nameInput.style.display = "inline-block";
    saveNameBtn.style.display = "inline-block";
    const nameSpansArr = document.querySelectorAll(".profile-info .name");
    if (nameSpansArr && nameSpansArr.length > 0) nameInput.value = nameSpansArr[0].innerText;
    nameSpansArr.forEach(span => span.style.display = "none");
  };

  saveNameBtn.onclick = () => {
    const newName = nameInput.value.trim();
    if (!newName) {
      showToast("Tên không được để trống!", 3000);
      return;
    }

    firebase.auth().currentUser.updateProfile({ displayName: newName })
      .then(() => {
        const nameSpansArr = document.querySelectorAll(".profile-info .name");
        nameSpansArr.forEach(span => {
          span.innerText = newName;
          span.style.display = "inline-block";
        });
        nameInput.style.display = "none";
        saveNameBtn.style.display = "none";
        showToast("Đổi tên thành công!");
      })
      .catch(err => {
        console.error(err);
        showToast("Lỗi khi đổi tên: " + err.message, 5000);
      });
  };

  // Khởi tạo bảng sau khi người dùng đăng nhập
  generateTable();
});


/* ============================
   THIẾT LẬP: Select tháng
   ============================ */
// Tạo các option Tháng 1 → 12
for (let m = 1; m <= 12; m++) {
  let o = document.createElement("option");
  o.value = m;
  o.innerText = "Tháng " + m;
  monthSelect.appendChild(o);
}
// Mặc định chọn tháng hiện tại
monthSelect.value = new Date().getMonth() + 1;


/* ============================
   HỖ TRỢ: Format giờ & làm tròn
   ============================ */

// Hiển thị thời gian dưới dạng “X:YY Sáng/Chiều”
function showPeriod(time) {
  if (!time) return "";
  let [h, m] = time.split(":");
  h = +h;
  return `${(h % 12) || 12}:${m} ${h < 12 ? "Sáng" : "Chiều"}`;
}

// Hàm làm tròn giờ (giữ nguyên vì code gốc sử dụng)
function round(h, m) {
  if (m <= 14) return h;
  if (m <= 44) return h + 0.5;
  return h + 1;
}


/* ============================
   TẠO BẢNG TIMESHEET: render + event
   ============================ */
function generateTable() {
  timesheetBody.innerHTML = "";
  const month = monthSelect.value;
  currentMonthLabel.innerText = month;

  db.ref(`timesheet/${currentUID}/${month}`).once("value").then(snap => {
    const saved = snap.val() || {};

    for (let day = 1; day <= 31; day++) {
      const row = timesheetBody.insertRow();
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

      const cH = row.insertCell(); // cột số giờ
      const cW = row.insertCell(); // cột lương

      const cActions = row.insertCell();
      cActions.style.display = "flex";
      cActions.style.gap = "5px";
      cActions.style.justifyContent = "center";
      cActions.style.alignItems = "center";

      // Nút "Xóa" giờ vào/ra
      const btnReset = document.createElement("button");
      btnReset.innerText = "Xóa";
      btnReset.className = "reset-btn";
      btnReset.style.padding = "2px 6px";
      btnReset.style.fontSize = "12px";
      btnReset.style.cursor = "pointer";

      btnReset.onclick = () => {
        showCustomConfirm("Bạn có chắc chắn muốn xóa giờ này không?", confirmed => {
          if (!confirmed) return;
          inputIn.value = "";
          inputOut.value = "";
          spIn.innerText = "";
          spOut.innerText = "";
          saveRow();
          showToast("Đã xóa giờ!");
        });
      };
      cActions.appendChild(btnReset);

      // Nút "Thêm" sub-row
      const btnAdd = document.createElement("button");
      btnAdd.innerText = "Thêm";
      btnAdd.className = "add-btn";
      btnAdd.style.padding = "2px 6px";
      btnAdd.style.fontSize = "12px";
      btnAdd.style.cursor = "pointer";

      btnAdd.onclick = async () => {
        const day = row.cells[0].innerText;
        const month = monthSelect.value;

        const snap = await db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).once("value");
        const subRows = snap.val() || [];

        // Xóa những sub-row hiện tại trên DOM
        let nextTr = row.nextElementSibling;
        while (nextTr && (nextTr.classList.contains("sub-row") || nextTr.classList.contains("sub-row-header"))) {
          const trToRemove = nextTr;
          nextTr = nextTr.nextElementSibling;
          trToRemove.remove();
        }

        // Render sub-rows đã lưu
        subRows.forEach(sub => {
          const { inputs } = addSubRow(row);
          inputs[0].value = sub.break || "";
          inputs[1].value = sub.go || "";
          inputs[2].value = sub.back || "";
        });

        // Thêm 1 sub-row trống mới
        addSubRow(row);

        calc(); // tính lại
      };
      cActions.appendChild(btnAdd);

      // Hàm lưu row (giờ vào/out) & giữ subRows cũ
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
        calc();
      };
      inputOut.onchange = () => {
        spOut.innerText = showPeriod(inputOut.value);
        saveRow();
        calc();
      };

      // Render các sub-rows đã lưu nếu có
      if (saved[day]?.subRows && Array.isArray(saved[day].subRows)) {
        saved[day].subRows.forEach(sub => {
          const { inputTr, inputs } = addSubRow(row);
          inputs[0].value = sub.break || "";
          inputs[1].value = sub.go || "";
          inputs[2].value = sub.back || "";
        });
      }
    } // end for day

    // Sau khi render xong: tính lại tổng
    calc();
  });
}


/* ============================
   APPLY / CLEAR giá trị cố định (break/go/back/in/out)
   ============================ */

// Áp dụng giá trị cố định break/go/back cho toàn bộ tháng
function applyFixed(type) {
  let typeName = type === "break" ? "Giờ giải lao" : type === "go" ? "Tiền đi" : "Tiền về";

  showCustomConfirm(`Có chắc muốn áp dụng tất cả ${typeName}?`, confirmed => {
    if (!confirmed) return;

    const month = monthSelect.value;
    if (!currentUID) return showToast("Chưa login!", 3000);

    let value = 0;
    if (type === "break") value = parseInt(document.getElementById("fixedBreak").value) || 0;
    if (type === "go") value = parseFloat(document.getElementById("fixedGo").value) || 0;
    if (type === "back") value = parseFloat(document.getElementById("fixedBack").value) || 0;

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

// Xóa giá trị cố định break/go/back cho toàn bộ tháng
function clearFixed(type) {
  let typeName = type === "break" ? "Giờ giải lao" : type === "go" ? "Tiền đi" : "Tiền về";

  showCustomConfirm(`Có chắc muốn xóa tất cả ${typeName} cho toàn bộ tháng?`, confirmed => {
    if (!confirmed) return;

    const month = monthSelect.value;
    if (!currentUID) return showToast("Chưa login!", 3000);

    for (let day = 1; day <= 31; day++) {
      db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).once("value").then(snap => {
        const subRows = snap.val() || [];
        subRows.forEach(sr => sr[type] = "");
        db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`).set(subRows);
      });
    }

    setTimeout(() => {
      generateTable();
      showToast(`Đã xóa ${typeName} cho toàn bộ tháng!`);
    }, 300);
  });
}

// Áp dụng giờ cố định in/out cho toàn bộ tháng
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

    for (let day = 1; day <= 31; day++) {
      db.ref(`timesheet/${currentUID}/${month}/${day}`).once("value").then(snap => {
        const old = snap.val() || { subRows: [] };
        db.ref(`timesheet/${currentUID}/${month}/${day}`).set({
          in: type === "in" ? value : old.in || "",
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

// Xóa giờ cố định in/out cho toàn bộ tháng
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

// Gắn sự kiện cho các nút apply/clear
if (clearBreakBtn) clearBreakBtn.onclick = () => clearFixed("break");
if (clearGoBtn) clearGoBtn.onclick = () => clearFixed("go");
if (clearBackBtn) clearBackBtn.onclick = () => clearFixed("back");

document.addEventListener("DOMContentLoaded", () => {
  if (applyInBtn) applyInBtn.onclick = () => applyFixedInOut("in");
  if (applyOutBtn) applyOutBtn.onclick = () => applyFixedInOut("out");
  if (applyBreakBtn) applyBreakBtn.onclick = () => applyFixed("break");
  if (applyGoBtn) applyGoBtn.onclick = () => applyFixed("go");
  if (applyBackBtn) applyBackBtn.onclick = () => applyFixed("back");
});

if (clearInBtn) clearInBtn.onclick = () => clearFixedInOut("in");
if (clearOutBtn) clearOutBtn.onclick = () => clearFixedInOut("out");


/* ============================
   SUB-ROW: hàm addSubRow & saveSubRow
   ============================ */

function addSubRow(mainTr, existingData = null) {
  const tbody = mainTr.parentElement;

  // Tạo hàng tiêu đề cho sub-row
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

  // Tạo hàng nhập liệu sub-row
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

  // Nút Xóa sub-row
  const btnDel = document.createElement("button");
  btnDel.innerText = "Xóa";
  btnDel.className = "delete-btn";
  btnDel.style.padding = "2px 6px";
  btnDel.style.fontSize = "12px";
  btnDel.style.cursor = "pointer";
  btnDel.onclick = () => {
    showCustomConfirm("Bạn có chắc chắn muốn xóa hàng này không?", confirmed => {
      if (!confirmed) return;
      headerTr.remove();
      inputTr.remove();
      saveSubRow(mainTr);
      calc();
      showToast("Đã xóa hàng!");
    });
  };
  tdAction.appendChild(btnDel);

  // Nút Ẩn sub-row (ẩn khi không có dữ liệu)
  const btnHide = document.createElement("button");
  btnHide.innerText = "Ẩn";
  btnHide.className = "hide-btn";
  btnHide.style.padding = "2px 6px";
  btnHide.style.fontSize = "12px";
  btnHide.style.cursor = "pointer";
  btnHide.style.marginLeft = "5px";
  btnHide.style.display = "none"; // mặc định ẩn
  btnHide.onclick = () => {
    headerTr.style.display = "none";
    inputTr.style.display = "none";
  };
  tdAction.appendChild(btnHide);

  inputTr.appendChild(tdAction);

  // Chèn vào DOM: insert header trước inputTr
  mainTr.after(inputTr);
  inputTr.before(headerTr);

  // Nếu existingData tồn tại → gán giá trị và hiện nút Ẩn
  if (existingData) {
    inputBreak.value = existingData.break || "";
    inputGo.value = existingData.go || "";
    inputBack.value = existingData.back || "";
    if (inputBreak.value || inputGo.value || inputBack.value) {
      btnHide.style.display = "inline-block";
    }
  }

  // oninput để lưu ngay khi thay đổi và hiện nút Ẩn nếu có dữ liệu
  [inputBreak, inputGo, inputBack].forEach(inp => {
    inp.oninput = () => {
      saveSubRow(mainTr);
      calc();
      if (inputBreak.value || inputGo.value || inputBack.value) {
        btnHide.style.display = "inline-block";
      } else {
        btnHide.style.display = "none";
      }
    };
  });

  return { headerTr, inputTr, inputs: [inputBreak, inputGo, inputBack] };
}

// Lưu các sub-rows tương ứng dòng mainTr vào Firebase
function saveSubRow(mainTr) {
  const day = mainTr.cells[0].innerText;
  const month = monthSelect.value;

  const subRowsData = [];
  let nextTr = mainTr.nextElementSibling;

  while (nextTr) {
    if (nextTr.classList.contains("sub-row")) {
      const inputs = nextTr.querySelectorAll("input");
      subRowsData.push({
        break: inputs[0]?.value || "",
        go: inputs[1]?.value || "",
        back: inputs[2]?.value || ""
      });
      nextTr = nextTr.nextElementSibling;
      continue;
    }
    if (nextTr.classList.contains("sub-row-header")) {
      nextTr = nextTr.nextElementSibling;
      continue;
    }
    break;
  }

  db.ref(`timesheet/${currentUID}/${month}/${day}/subRows`)
    .set(subRowsData)
    .then(() => console.log("Lưu sub-row thành công!", subRowsData))
    .catch(err => console.error(err));
}


/* ============================
   CALC: Tính giờ làm việc & lương
   ============================ */

function calc() {
  let total = 0;
  const rate = +rateInput.value;
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

      // Tính giờ giải lao và tiền đi/tiền về từ sub-row
      let breakHours = 0;
      let subMoney = 0;
      let nextTr = r.nextElementSibling;

      while (nextTr && (nextTr.classList.contains("sub-row") || nextTr.classList.contains("sub-row-header"))) {
        if (nextTr.classList.contains("sub-row")) {
          const inputs = nextTr.querySelectorAll("input");
          const breakInput = parseInt(inputs[0]?.value) || 0; // phút
          const goInput = parseFloat(inputs[1]?.value) || 0;
          const backInput = parseFloat(inputs[2]?.value) || 0;

          breakHours += breakInput / 60;
          subMoney += goInput + backInput;
        }
        nextTr = nextTr.nextElementSibling;
      }

      const realHours = Math.max(totalHours - breakHours, 0);
      const wageByHour = Math.round(realHours * rate);
      const wage = wageByHour + subMoney;

      cHours.innerText = realHours.toFixed(2);
      cWage.innerText = wage.toLocaleString();

      total += wage;
    } else {
      cHours.innerText = "";
      cWage.innerText = "";
    }
  });

  if (totalLabel) totalLabel.innerText = total.toLocaleString();
  if (floatingTotalValue) floatingTotalValue.innerText = total.toLocaleString();
}


/* ============================
   SCROLL UP: Nút cuộn lên đầu trang
   ============================ */
window.onscroll = () => {
  if (!scrollBtn) return;
  scrollBtn.style.display =
    (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ?
      "block" : "none";
};

if (scrollBtn) scrollBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};


/* ============================
   GẮN SỰ KIỆN – apply / clear / onchange
   ============================ */

// Khi chọn tháng → render lại bảng
if (monthSelect) monthSelect.onchange = generateTable;
// Khi thay đổi đơn giá → tính lại
if (rateInput) rateInput.onchange = calc;

// Xử lý nút đăng xuất
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    showCustomConfirm("Bạn có chắc muốn đăng xuất không?", confirmed => {
      if (confirmed) {
        firebase.auth().signOut()
          .then(() => window.location = "login.html")
          .catch(err => alert("Lỗi khi đăng xuất: " + err.message));
      }
    });
  });
}

// Gắn sự kiện cho các nút apply/clear khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  if (applyInBtn) applyInBtn.onclick = () => applyFixedInOut("in");
  if (applyOutBtn) applyOutBtn.onclick = () => applyFixedInOut("out");
  if (applyBreakBtn) applyBreakBtn.onclick = () => applyFixed("break");
  if (applyGoBtn) applyGoBtn.onclick = () => applyFixed("go");
  if (applyBackBtn) applyBackBtn.onclick = () => applyFixed("back");

  if (clearInBtn) clearInBtn.onclick = () => clearFixedInOut("in");
  if (clearOutBtn) clearOutBtn.onclick = () => clearFixedInOut("out");
});

/* ============================
   KẾT THÚC FILE
   ============================ */
