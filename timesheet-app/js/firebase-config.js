// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyByHAvr1g1pzuE5E2LjYkJBj3G3CrSRr5g",
  authDomain: "timesheet-app-d0744.firebaseapp.com",
  databaseURL: "https://timesheet-app-d0744-default-rtdb.firebaseio.com",
  projectId: "timesheet-app-d0744",
  storageBucket: "timesheet-app-d0744.firebasestorage.app",
  messagingSenderId: "407336345449",
  appId: "1:407336345449:web:ba0f8975ea750cb257e7f8",
  measurementId: "G-DQ8TCP2MET"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
// Kết nối database
const db = firebase.database();
// Kết nối authentication (nếu dùng đăng nhập/đăng ký)
const auth = firebase.auth();