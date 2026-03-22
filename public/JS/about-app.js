// ==========================================
// 1. Socket.io እና መጀመሪያ የሚሰሩ ቅንብሮች
// ==========================================
const socket = io();
let currentTargetPage = "index.html"; // ለክፍያ ሂደት መድረሻ ገጽ

// 2. የቋንቋ ትርጉሞች (Translations)
const translations = {
    am: {
        "ta-title": "የታንከር ውሃ መጠን መቆጣጠሪያ",
        "ta-desc": "የታንከርዎን የውሃ መጠን በማንኛውም ቦታ ሆነው ለመቆጣጠር።",
        "qu-title": "የውሃ ጥራት",
        "qu-desc": "የውሃውን ንጽህና፣ ፒኤች (pH) እና የባክቴሪያ መኖርን ለመለየት።",
        "irr_title": "የመስኖ አፈር እርጥበት",
        "irr-desc": "የአፈርን እርጥበት በመለካት ለመስኖ እርሻዎ ተገቢውን ውሃ በሰዓቱ ለመስጠት።",
        "pay-btn": "አሁኑኑ ይክፈሉ",
        "gr-title": "የከርሰ ምድር ውሃ መጠን",
        "gr-disc": "የከርሰ ምድር ውሃ ሲያልቅ ፓምፑ እንዳይቃጠል በራሱ እንዲያቆም የሚያደርግ።",
        "app-title": "ስለ Smart Water Monitor",
        "how-it-works-title": "ሲስተሙ እንዴት ይሰራል?",
        "app-intro": "ይህ ሲስተም የውሃ ማጠራቀሚያ ታንከሮችን መጠን በዘመናዊ መንገድ ለመቆጣጠር ታስቦ የተሰራ ነው።",
        "hw-desc": "በታንከሩ አናት ላይ የሚገጠመው Ultrasonic Sensor የውሃውን ርቀት ይለካል።",
        "srv-desc": "ESP32 መረጃውን በ Wi-Fi አማካኝነት ለ Node.js ሰርቨር ይልካል።",
        "web-desc-list": "ተጠቃሚው በየትኛውም ቦታ ሆኖ በድረ-ገጹ ላይ የውሃውን መጠን በፐርሰንት (%) ያያል።",
        "web-title": "የድረ-ገጹ (Web) ልዩ ባህሪያት",
        "feat-1-h": "Real-time Update",
        "feat-1-p": "መረጃው በቅጽበት (ያለ Refresh) ይቀየራል።",
        "feat-2-h": "Excel Reports",
        "feat-2-p": "የውሃ ፍጆታ ታሪክን በ Excel ማውረድ ይቻላል።",
        "feat-3-h": "Mobile Friendly",
        "feat-3-p": "በስልክም ሆነ በኮምፒውተር ለመጠቀም ይመቻል።",
        "phone-text": "ለበለጠ መረጃ ይደውሉልን፦",
        "footer-text": "© 2026 አሀዱ ቴክ አካዳሚ። መብቱ በህግ የተጠበቀ ነው።"
    },
    en: {
        "ta-title": "Tanker Amount Monitor",
        "ta-desc": "Monitor your tank's water level from anywhere, anytime.",
        "qu-title": "Water Quality",
        "qu-desc": "Detect water purity, pH levels, and the presence of bacteria.",
        "irr_title": "Irrigation Soil Moisture",
        "irr-desc": "Measure soil moisture to provide the right amount of water to your irrigation farm on time.",
        "pay-btn": "Pay Now",
        "gr-title": "Ground Water Level",
        "gr-disc": "Prevents the pump from burning out by automatically stopping it when groundwater runs out.",
        "app-title": "About Smart Water Monitor",
        "how-it-works-title": "How it Works",
        "app-intro": "This system is designed to monitor water tank levels modernly.",
        "hw-desc": "Ultrasonic Sensor mounted on top measures water distance.",
        "srv-desc": "ESP32 sends data to Node.js server via Wi-Fi.",
        "web-desc-list": "Users can see water level in percentage (%) from anywhere.",
        "web-title": "Web Dashboard Features",
        "feat-1-h": "Real-time Update",
        "feat-1-p": "Updates instantly without refreshing the page.",
        "feat-2-h": "Excel Reports",
        "feat-2-p": "Download water consumption history in Excel.",
        "feat-3-h": "Mobile Friendly",
        "feat-3-p": "Perfectly fits both mobile and desktop screens.",
        "phone-text": "Contact us for more info:",
        "footer-text": "© 2026 Ahadu Tech Academy. All Rights Reserved."
    }
};

// ==========================================
// 3. የቋንቋ እና የ UI ተግባራት (UI Logic)
// ==========================================
function changeLang(lang) {
    if (!translations[lang]) return;
    for (let id in translations[lang]) {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = translations[lang][id];
        }
    }
    localStorage.setItem('selectedLang', lang);
}
// ==========================================
// 1. Socket.io አጀማመር
// ==========================================
// const socket = io();

// ==========================================
// 2. የ UI ማስተካከያ ፋንክሽኖች (Core Logic)
// ==========================================

// ይህ ፋንክሽን ማንኛውንም አገልግሎት ክፍት ወይም ዝግ ለማድረግ ያገለግላል
function setServiceStatus(key, isApproved) {
    const payBtn = document.getElementById(`pay-btn-${key}`);
    const closedBtn = document.getElementById(`closed-btn-${key}`);
    const openBtn = document.getElementById(`open-btn-${key}`);

    if (isApproved) {
        // ክፍት ሲሆን
        if (payBtn) payBtn.style.setProperty('display', 'none', 'important');
        if (closedBtn) closedBtn.style.setProperty('display', 'none', 'important');
        if (openBtn) openBtn.style.setProperty('display', 'block', 'important');
        localStorage.setItem(`pay_status_${key}`, 'approved');
    } else {
        // ዝግ ሲሆን (ውድቅ ሲደረግ)
        if (payBtn) payBtn.style.setProperty('display', 'block', 'important');
        if (closedBtn) closedBtn.style.setProperty('display', 'block', 'important');
        if (openBtn) openBtn.style.setProperty('display', 'none', 'important');
        localStorage.removeItem(`pay_status_${key}`);
    }
}

// ገጹ ሲከፈት ሁሉንም በተኖች የሚያስተካክል
function refreshAllUI() {
    const services = ['tanker', 'quality', 'soil', 'ground'];
    services.forEach(key => {
        const isApproved = localStorage.getItem(`pay_status_${key}`) === 'approved';
        setServiceStatus(key, isApproved);
    });
}

// ==========================================
// 3. Socket.io መልዕክት መቀበያ (Real-time)
// ==========================================

// ✅ ክፍያ ሲጸድቅ
socket.on('paymentApproved', (data) => {
    const service = (data.serviceName || "").toLowerCase();
    let key = "";
    if (service.includes('tank')) key = "tanker";
    else if (service.includes('quality')) key = "quality";
    else if (service.includes('soil')) key = "soil";
    else if (service.includes('ground')) key = "ground";

    if (key) {
        setServiceStatus(key, true);
        alert(`✅ ደስ የሚል ዜና! የ ${data.serviceName} አገልግሎት ክፍት ሆኖልዎታል።`);
    }
});

// ❌ ክፍያ ውድቅ ሲደረግ
socket.on('paymentRejected', (data) => {
    const service = (data.serviceName || "").toLowerCase();
    let key = "";
    if (service.includes('tank')) key = "tanker";
    else if (service.includes('quality')) key = "quality";
    else if (service.includes('soil')) key = "soil";
    else if (service.includes('ground')) key = "ground";

    if (key) {
        // ወዲያውኑ UI-ውን ወደ ቀድሞው ይመልሳል
        setServiceStatus(key, false);
        alert(`⚠️ ማሳሰቢያ፦ የ ${data.serviceName} ክፍያዎ ውድቅ ተደርጓል። \nምክንያት፦ ${data.reason}`);
    }
});
// ተጠቃሚው ካልገባ ወደ login.html ይመልሰዋል
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}
// ==========================================
// 4. ክፍያ የመላክ ስራ (Upload)
// ==========================================

async function uploadReceipt(event) {
    if (event) event.preventDefault();

    const fileInput = document.getElementById('receiptInput');
    const serviceName = document.getElementById('selectedService').value;
    const username = localStorage.getItem('userEmail') || localStorage.getItem('userName') || "ያልታወቀ ተጠቃሚ";

    if (!fileInput.files[0]) {
        alert("እባክዎ መጀመሪያ የደረሰኝ ፎቶ ይምረጡ!");
        return;
    }

    const formData = new FormData();
    formData.append('receipt', fileInput.files[0]);
    formData.append('serviceName', serviceName);
    formData.append('username', username);

    try {
        const response = await fetch('/submit-payment', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) {
            alert("ደረሰኙ በትክክል ተልኳል። አድሚኑ እስኪያጸድቅ ይጠብቁ።");
            document.getElementById("paymentModal").style.display = "none";
        }
    } catch (err) { alert("መላክ አልተቻለም!"); }
}

// ==========================================
// 5. ገጹ ሲከፈት የሚሰሩ ስራዎች
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // ቋንቋውን አድስ
    const savedLang = localStorage.getItem('selectedLang') || 'am';
    if (typeof changeLang === "function") changeLang(savedLang);
    
    // በተኖቹን አድስ
    refreshAllUI();
});

// ለሞዳል መክፈቻ
function openPaymentModal(serviceName) {
    document.getElementById('selectedService').value = serviceName;
    document.getElementById("paymentModal").style.display = "block";
}
function closeModal() {
    document.getElementById("paymentModal").style.display = "none";
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}


// --- Admin Navigation ---
function goToAdmin() {
    // ተጠቃሚውን ወደ አድሚን ሎጊን ገጽ ይወስደዋል
    window.location.href = "admin-login.html";
}