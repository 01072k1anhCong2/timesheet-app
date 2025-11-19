const firebaseConfig = {
  apiKey: "AIzaSyCi_64FqLHar_IBed4hSPpTJZpYvoE1NHo",
  authDomain: "timesheet-a8dc2.firebaseapp.com",
  databaseURL: "https://timesheet-a8dc2-default-rtdb.firebaseio.com",
  projectId: "timesheet-a8dc2",
  storageBucket: "timesheet-a8dc2.firebasestorage.app",
  messagingSenderId: "637539776978",
  appId: "1:637539776978:web:e7d71ffd9378876309b00b"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
// Kết nối database
const auth = firebase.auth();
// GÁN RA GLOBAL
window.auth = auth;  
