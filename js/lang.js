import { LANG_JP as LOGIN_JP, LANG_EN as LOGIN_EN } from './lang-login.js';
import { LANG_JP as REGISTER_JP, LANG_EN as REGISTER_EN } from './lang-register.js';
import { LANG_JP as INDEX_JP, LANG_EN as INDEX_EN } from './lang-index.js';

// Biến lưu ngôn ngữ hiện tại
let currentLang = {};
// Kết hợp các ngôn ngữ
export const LANG_JP = { ...LOGIN_JP, ...REGISTER_JP, ...INDEX_JP }; 
export const LANG_EN = { ...LOGIN_EN, ...REGISTER_EN, ...INDEX_EN };

// Khi chọn ngôn ngữ
const langBtn = document.getElementById("langBtn");
const langList = document.getElementById("langList");

// Bật/tắt dropdown khi click nút
langBtn.addEventListener("click", () => {
  langList.classList.toggle("active");
});

// Khi chọn ngôn ngữ
langList.querySelectorAll("li").forEach(li => {
  li.addEventListener("click", () => {
    const lang = li.getAttribute("data-lang"); // Lấy code ngôn ngữ
    if(lang === "vn"){
      location.reload(); // Tải lại trang để về ngôn ngữ mặc định (Tiếng Việt)
      return;
    }
    else if(lang === "jp") currentLang = LANG_JP;
    else if(lang === "en") currentLang = LANG_EN;

    // Cập nhật tất cả element có data-lang
    document.querySelectorAll("[data-lang]").forEach(el => {
      const key = el.getAttribute("data-lang");
      if(el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = currentLang[key] || el.placeholder;
      } else {
        el.innerText = currentLang[key] || el.innerText;
      }
    });

    // Cập nhật nút hiển thị
    langBtn.innerText = li.innerText;

    // Ẩn dropdown
    langList.classList.remove("active");
  });
});


// Click ngoài để đóng dropdown
document.addEventListener("click", e => {
  if(!langBtn.contains(e.target) && !langList.contains(e.target)) {
    langList.classList.remove("active");
  }
});

