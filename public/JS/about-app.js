// Login በተኑ ሲነካ የሚሰራ ፋንክሽን
function loginUser() {
    // እዚህ ጋር የፓስወርድ ቼክ ማድረግ ትችላለህ
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "admin" && password === "1234") { // ለምሳሌ
        // በኮምፒውተሩ ላይ መግባቱን መመዝገብ
        localStorage.setItem("isLoggedIn", "true");
        // ወደ ቀጣዩ ገጽ መላክ
        window.location.href = "about-app.html";
    } else {
        alert("ስህተት! እባክዎ ትክክለኛ መረጃ ያስገቡ።");
    }
}

const translations = {
    am: {
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

// 1. የቋንቋ መቀየሪያ
function changeLang(lang) {
    for (let id in translations[lang]) {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = translations[lang][id];
        }
    }
    localStorage.setItem('selectedLang', lang);
}

// 2. Modal መክፈቻ (እነዚህ መስራት አለባቸው!)
function openPaymentModal() {
    console.log("Modal opening..."); 
    document.getElementById("paymentModal").style.display = "block";
}

// 3. Modal መዝጊያ
function closeModal() {
    document.getElementById("paymentModal").style.display = "none";
}

// 4. የክፍያ ሂደት (የተስተካከለ)
async function processChapa(method, targetPage) {
    const email = localStorage.getItem("loggedUser") || "guest@example.com";
    
    // ለተጠቃሚው መመሪያ መስጠት
    const infoMessage = `ውድ ደንበኛችን በ ${method} በኩል ክፍያዎን ወደ +251937100547 ይላኩ። ከዛም ደረሰኙን በቴሌግራም ይላኩልን።`;
    alert(infoMessage);
    
    // ተጠቃሚው ለዛ አገልግሎት የተመደበው ገጽ ላይ እንዲሄድ ማድረግ
    if (targetPage) {
        window.location.href = targetPage;
    } else {
        window.location.href = "index.html"; // Default መድረሻ
    }
}

// Modal ለመክፈት የምንጠቀመው ጊዜያዊ ተለዋዋጭ
let currentTargetPage = "index.html";

function openPaymentModal(page) {
    currentTargetPage = page; // የትኛው ገጽ መሄድ እንዳለበት እናስቀምጣለን
    document.getElementById("paymentModal").style.display = "block";
}

// በ Modal ውስጥ ያሉትን በተኖች ስንነካ
function handlePayment(method) {
    processChapa(method, currentTargetPage);
}

// 5. ገጹ ሲከፈት
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem('selectedLang') || 'am';
    changeLang(savedLang);
    // ማሳሰቢያ፡ እዚህ ገጽ ላይ ሎጊን ቼክ ካደረግክ ሰው ገና አፑን ሳያይ ይባረራል
    // ስለዚህ ለጊዜው ቼኩን ዳሽቦርድ ላይ ብቻ አድርገው
});

