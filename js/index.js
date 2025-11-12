let currentUID = null;

// Chặn truy cập khi chưa login
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location = "login.html";
  } else {
    currentUID = user.uid;

    // Hiển thị tên từ Auth
    const nameSpan = document.querySelector(".profile-info .name");
    // bắt đâu đỏi tên  
    if(nameSpan) nameSpan.innerText = user.displayName || "Người dùng";
    // Lấy các phần tử đổi tên
const nameInput = document.getElementById("nameInput");
const editBtn   = document.getElementById("editNameBtn");
const saveBtn   = document.getElementById("saveNameBtn");

// Nút “Đổi tên”
editBtn.onclick = () => {
  nameInput.style.display = "inline-block";
  saveBtn.style.display = "inline-block";
  nameInput.value = nameSpan.innerText; // hiện tên hiện tại
  nameSpan.style.display = "none";
};

// Nút “Lưu tên”
saveBtn.onclick = () => {
  const newName = nameInput.value.trim();
  if(!newName) {
    alert("Tên không được để trống!");
    return;
  }

  firebase.auth().currentUser.updateProfile({
    displayName: newName
  }).then(() => {
    nameSpan.innerText = newName;
    nameSpan.style.display = "inline-block";
    nameInput.style.display = "none";
    saveBtn.style.display = "none";
    alert("Đổi tên thành công!");
  }).catch(err => {
    console.error(err);
    alert("Lỗi khi đổi tên: " + err.message);
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

      // Nút reset giờ
      const btnReset = document.createElement("button");
      btnReset.innerText = "Xóa";
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

      // Nút thêm sub-row
      const btnAdd = document.createElement("button");
      btnAdd.innerText = "Thêm";
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

  // Nút Ẩn, hiển thị chỉ khi có dữ liệu
  const btnHide = document.createElement("button");
  btnHide.innerText = "Ẩn";
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




monthSelect.onchange = generateTable;
document.getElementById("rate").onchange = calc;

document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => { window.location = "login.html"; })
  .catch(err => alert("Lỗi khi đăng xuất: " + err.message));
});
