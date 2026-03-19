// --- 1. ዳታ አያያዝ (LocalStorage) ---
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// --- 2. የምዝገባ (Register) ክፍል ---
let otpCode; 
function sendCode() {
    otpCode = Math.floor(1000 + Math.random() * 9000);
    alert("Your OTP Code: " + otpCode);
}

function register() {
    let email = document.getElementById("email").value;
    let otp = document.getElementById("otp").value;

    if (otp != otpCode) {
        alert("Invalid OTP");
        return;
    }

    let user = {
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        password: document.getElementById("password").value,
        username: document.getElementById("username").value,
        email: email,
        phone: document.getElementById("phone").value,
        country: document.getElementById("country").value,
        gender: document.getElementById("gender").value
    };

    localStorage.setItem(email, JSON.stringify(user));
    alert("Registration Successful! Now you can login.");
    window.location.href = "login.html";
}

// --- 3. መግቢያ (Login) ክፍል ---
function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    let userData = localStorage.getItem(email);

    if (userData) {
        let user = JSON.parse(userData);
        if (user.password === password) {
            localStorage.setItem("loggedUser", email);
            localStorage.setItem("loggedUserName", user.firstname); // ይህ ተጨምሯል
            localStorage.setItem("isLoggedIn", "true");
            window.location.href = "about-app.html";
        } else {
            alert("Invalid Password!");
        }
    } else {
        alert("Please register first!");
        window.location.href = "register.html";
    }
}

// --- 4. የፌስቡክ አይነት Password Reset (አሁን የሚሰራው) ---
let facebookOTP; // ይህ ቫሪያብል ኮዱን ይይዛል

function sendFacebookStyleCode() {
    let emailInput = document.getElementById("email2").value;
    let phoneInput = document.getElementById("phone").value;

    let userData = localStorage.getItem(emailInput);

    if (userData) {
        let user = JSON.parse(userData);

        if (user.phone === phoneInput) {
            facebookOTP = Math.floor(1000 + Math.random() * 9000);
            alert("የማረጋገጫ ኮድ: " + facebookOTP);

            // ክፍሎቹን ማሳየት
            document.getElementById("otp-section").style.display = "block";
            document.getElementById("sendBtn").style.display = "none";
        } else {
            alert("ስልክ ቁጥሩ አልተገኘም!");
        }
    } else {
        alert("ኢሜይሉ አልተገኘም!");
    }
}

// ይህ ፈንክሽን ነው አልሰራ ያለህ፤ አሁን ተስተካክሏል
function verifyOTP() {
    let enteredOTP = document.getElementById("otp2").value; // በ HTML ላይ id="otp2" መሆኑን አረጋግጥ

    // የገቡት ቁጥሮች አንድ መሆናቸውን በደንብ ቼክ እናደርጋለን
    if (enteredOTP != "" && enteredOTP == facebookOTP) {
        alert("ኮዱ ትክክል ነው!");
        document.getElementById("otp-section").style.display = "none";
        document.getElementById("password-section").style.display = "block";
    } else {
        alert("የገቡት ኮድ ስህተት ነው! እባክዎ እንደገና ይሞክሩ።");
    }
}

function finishReset() {
    let email = document.getElementById("email2").value;
    let newPass = document.getElementById("newPassword").value;
    let user = JSON.parse(localStorage.getItem(email));

    if (user && newPass !== "") {
        user.password = newPass;
        localStorage.setItem(email, JSON.stringify(user));
        alert("የይለፍ ቃል ተቀይሯል!");
        window.location.href = "login.html";
    } else {
        alert("እባክዎ አዲስ ፓስወርድ ያስገቡ!");
    }
}

// --- 5. የውሃ መጠን እና ሰዓት (ያለ ለውጥ) ---
function updateDateTime() {
    const dateTimeEl = document.getElementById('date-time');
    if (dateTimeEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        dateTimeEl.innerText = now.toLocaleDateString('en-US', options);
    }
}
setInterval(updateDateTime, 1000);

function updateWaterLevel(percent) {
    const waterElement = document.getElementById('water-level');
    if (waterElement) waterElement.style.height = percent + "%";
}