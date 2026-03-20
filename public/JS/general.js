// --- 1. Global Variables & Socket.io ---
let otpCode; 
let facebookOTP;
const socket = io(); // Real-time ግንኙነት መፍጠር

// --- 2. Security Check (ብራውዘር ላይ ብቻ የሚሰራ) ---
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;
    
    // ተጠቃሚው ሳይገባ ወደ ዳሽቦርድ ገጾች እንዳይገባ መከልከል
    if (!currentPage.includes("login.html") && !currentPage.includes("register.html") && currentPage !== "/" && currentPage !== "/index.html") {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            window.location.href = "login.html";
        }
    }
    updateDateTime();
});

// --- 3. Real-time Dashboard Update ---
socket.on('levelUpdate', (newLevel) => {
    updateWaterLevel(newLevel);
});

function updateWaterLevel(percent) {
    const waterElement = document.getElementById('water-level');
    const percentText = document.getElementById('percent-val');
    const volumeText = document.getElementById('volume-val');
    
    if (waterElement) waterElement.style.height = percent + "%";
    if (percentText) percentText.innerText = percent + "%";
    if (volumeText) volumeText.innerText = (percent / 100) * 1000; // 1000L ታንከር
}

// --- 4. Registration (ምዝገባ) ---
function sendCode() {
    otpCode = Math.floor(1000 + Math.random() * 9000);
    alert("የምዝገባ ማረጋገጫ ኮድ (OTP): " + otpCode);
}

function register() {
    let email = document.getElementById("email").value;
    let otp = document.getElementById("otp").value;

    if (otp != otpCode) {
        alert("የገቡት OTP ስህተት ነው!");
        return;
    }

    if (localStorage.getItem(email)) {
        alert("ይህ ኢሜይል ቀድሞ ተመዝግቧል!");
        return;
    }

    let user = {
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        password: document.getElementById("password").value,
        email: email,
        phone: document.getElementById("phone").value
    };

    localStorage.setItem(email, JSON.stringify(user));
    alert("ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።");
    window.location.href = "login.html";
}

// --- 5. Login (መግቢያ) ---
function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    let userData = localStorage.getItem(email);

    if (userData) {
        let user = JSON.parse(userData);
        if (user.password === password) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedUser", email);
            localStorage.setItem("loggedUserName", user.firstname);
            window.location.href = "about-app.html"; 
        } else {
            alert("የይለፍ ቃል ስህተት ነው!");
        }
    } else {
        alert("ተጠቃሚው አልተገኘም! እባክዎ ይመዝገቡ።");
    }
}

// --- 6. Password Reset (የይለፍ ቃል መቀየሪያ) ---
function sendFacebookStyleCode() {
    let emailInput = document.getElementById("email2").value;
    let phoneInput = document.getElementById("phone").value;
    let userData = localStorage.getItem(emailInput);

    if (userData) {
        let user = JSON.parse(userData);
        if (user.phone === phoneInput) {
            facebookOTP = Math.floor(1000 + Math.random() * 9000);
            alert("ማረጋገጫ ኮድ: " + facebookOTP);
            document.getElementById("otp-section").style.display = "block";
        } else {
            alert("ስልክ ቁጥሩ ልክ አይደለም!");
        }
    } else {
        alert("ኢሜይሉ አልተገኘም!");
    }
}

function verifyOTP() {
    let enteredOTP = document.getElementById("otp2").value;
    if (enteredOTP != "" && enteredOTP == facebookOTP) {
        alert("ኮዱ ትክክል ነው!");
        document.getElementById("otp-section").style.display = "none";
        document.getElementById("password-section").style.display = "block";
    } else {
        alert("የገቡት ኮድ ስህተት ነው!");
    }
}

function finishReset() {
    let email = document.getElementById("email2").value;
    let newPass = document.getElementById("newPassword").value;
    let userData = localStorage.getItem(email);

    if (userData && newPass !== "") {
        let user = JSON.parse(userData);
        user.password = newPass;
        localStorage.setItem(email, JSON.stringify(user));
        alert("የይለፍ ቃል ተቀይሯል! አሁን መግባት ይችላሉ።");
        window.location.href = "login.html";
    }
}

// --- 7. Utilities ---
function updateDateTime() {
    const dateTimeEl = document.getElementById('date-time');
    if (dateTimeEl) {
        dateTimeEl.innerText = new Date().toLocaleString('en-US');
    }
}
setInterval(updateDateTime, 1000);

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}