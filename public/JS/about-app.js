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
function updateUItoOpen(key) {
    console.log("UI እየተቀየረ ነው ለ key:", key);
    
    const payBtn = document.getElementById(`pay-btn-${key}`);
    const closedBtn = document.getElementById(`closed-btn-${key}`);
    const openBtn = document.getElementById(`open-btn-${key}`);

    // መክፈያ እና ዝግ መሆኑን የሚገልጹትን ደብቅ
    if (payBtn) payBtn.style.setProperty('display', 'none', 'important');
    if (closedBtn) closedBtn.style.setProperty('display', 'none', 'important');
    
    // Open በተኑን አሳይ
    if (openBtn) {
        openBtn.classList.add('show-open-btn'); 
        // ለጥንቃቄ በቀጥታም display: block እንበለው
        openBtn.style.setProperty('display', 'block', 'important');
        console.log(key + " በተን አሁን መታየት አለበት!");
    } else {
        console.error("ID አልተገኘም፦ open-btn-" + key);
    }
}

// ==========================================
// 4. የክፍያ እና ሞዳል ተግባራት (Payment Logic)
// ==========================================
function openPaymentModal(serviceName) {
    console.log("ሞዳሉ እየተከፈተ ነው ለ፦ " + serviceName);
    const selectedInput = document.getElementById('selectedService');
    if (selectedInput) {
        selectedInput.value = serviceName;
    }
    document.getElementById("paymentModal").style.display = "block";
}

function closeModal() {
    document.getElementById("paymentModal").style.display = "none";
}
async function uploadReceipt() {
    const fileInput = document.getElementById('receiptInput');
    const file = fileInput.files[0];
    
    // 1. የአገልግሎቱን ስም ከ Input value ውስጥ በትክክል መውሰድ
    const serviceNameValue = document.getElementById('selectedService').value;
    
    // 2. የተጠቃሚውን ስም ከ LocalStorage መውሰድ (ወይም 'Molla' ብለህ መጻፍ)
    const loggedUser = localStorage.getItem('loggedUser') || 'Molla';

    if (!file) {
        alert("እባክዎ መጀመሪያ የደረሰኙን ምስል ይምረጡ!");
        return;
    }

    const formData = new FormData();
    formData.append('receipt', file); 
    
    // --- ትኩረት፦ እዚህ ጋር ጥቅስ ምልክት (' ') መኖር የለበትም! ---
    formData.append('username', loggedUser); // 'user' ሳይሆን loggedUser የሚለውን ተለዋዋጭ
    formData.append('serviceName', serviceNameValue); // 'service' ሳይሆን serviceNameValue የሚለውን ተለዋዋጭ

    try {
        const response = await fetch('/submit-payment', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.success) {
            alert("የመታወቂያ ምስሉ (ደረሰኙ) በትክክል ተልኳል!");
            closeModal();
        }
    } catch (error) {
        console.error("Upload Error:", error);
    }
}

async function processChapa(method, targetPage) {
    const infoMessage = `ውድ ደንበኛችን በ ${method} በኩል ክፍያዎን ወደ +251937100547 ይላኩ። ከዛም ደረሰኙን እዚህ ሲስተም ላይ ይጫኑ።`;
    alert(infoMessage);
    if (targetPage) window.location.href = targetPage;
}

function handlePayment(method) {
    processChapa(method, currentTargetPage);
}

// ==========================================
// 5. ሪል-ታይም የ Socket.io መልዕክት መቀበያ
// ==========================================
socket.on('paymentApproved', (data) => {
    console.log("ከአድሚን መልዕክት ደርሷል:", data);
    
    const service = (data.serviceName || "").toLowerCase().trim();
    let key = "";

    // ስሞቹን ማዛመድ
    if (service.includes('tank')) key = "tanker";
    else if (service.includes('quality')) key = "quality";
    else if (service.includes('soil')) key = "soil";
    else if (service.includes('ground')) key = "ground";

    if (key) {
        // 1. ID-ዎቹን በትክክል መፈለግ
        const payBtn = document.getElementById(`pay-btn-${key}`);
        const closedBtn = document.getElementById(`closed-btn-${key}`);
        const openBtn = document.getElementById(`open-btn-${key}`);

        // 2. በግድ (Force) እንዲታዩ ማድረግ (!important በ JS)
        if (payBtn) payBtn.setAttribute('style', 'display: none !important');
        if (closedBtn) closedBtn.setAttribute('style', 'display: none !important');
        
        if (openBtn) {
            openBtn.setAttribute('style', 'display: block !important');
            
            // 3. LocalStorage ካልሰራ በስተቀር ለጊዜው በተኑ እንዲቆይ ያደርጋል
            try {
                localStorage.setItem(`pay_status_${key}`, 'approved');
            } catch (e) {
                console.warn("Storage ተከልክሏል፣ ግን በተኑ መታየት አለበት።");
            }
            
            alert(data.serviceName + " አገልግሎት አሁን ክፍት ሆኖልዎታል።");
        } else {
            console.error("ስህተት፡ open-btn-" + key + " የሚል ID በ HTML ውስጥ አልተገኘም!");
        }
    }
});
// socket.on('paymentApproved', (data) => {
//     console.log("ከአድሚን መልዕክት ደርሷል:", data);
    
//     // 1. የመጣውን ስም ወደ ትናንሽ ፊደላት ቀይረን እናጽዳው
//     const service = (data.serviceName || "").toLowerCase().trim();
//     let key = "";

//     // 2. ስሞቹን ከ ID-ዎቹ ጋር እናዛምድ
//     if (service.includes('tank')) {
//         key = "tanker";
//     } else if (service.includes('quality')) {
//         key = "quality";
//     } else if (service.includes('soil')) {
//         key = "soil";
//     } else if (service.includes('ground')) {
//         key = "ground";
//     }

//     // 3. በተኑን እንዲመጣ እናድርግ
//     if (key) {
//         const payBtn = document.getElementById(`pay-btn-${key}`);
//         const closedBtn = document.getElementById(`closed-btn-${key}`);
//         const openBtn = document.getElementById(`open-btn-${key}`);

//         if (payBtn) payBtn.style.display = 'none';
//         if (closedBtn) closedBtn.style.display = 'none';
//         if (openBtn) {
//             openBtn.style.display = 'block';
//             localStorage.setItem(`pay_status_${key}`, 'approved');
//             alert(data.serviceName + " አገልግሎት አሁን ክፍት ሆኖልዎታል።");
//         }
//     }
// });
// socket.on('paymentApproved', (data) => {
//     console.log("ከአድሚን መልዕክት ደርሷል:", data);
    
//     // በዳታው ውስጥ serviceName ወይም service መኖሩን ቼክ እናደርጋለን
//     const approvedService = data.serviceName || data.service; 
    
//     let key = "";
//     if (approvedService === 'Tanker Monitor') key = "tanker";
//     else if (approvedService === 'Water Quality') key = "quality";
//     else if (approvedService === 'Soil Moisture') key = "soil";
//     else if (approvedService === 'Ground Water') key = "ground";

//     if (key) {
//         updateUItoOpen(key);
//         localStorage.setItem(`pay_status_${key}`, 'approved');
//         alert(approvedService + " አገልግሎት አሁን ክፍት ሆኖልዎታል።");
//     } else {
//         console.error("ስሙ አልተገኘም! የመጣው ስም፦", approvedService);
//     }
// });

// ==========================================
// 6. ገጹ ሲከፈት (Init)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const services = ['tanker', 'quality', 'soil', 'ground'];
    const savedLang = localStorage.getItem('selectedLang') || 'am';
    changeLang(savedLang);
    services.forEach(key => {
        // LocalStorage ውስጥ 'approved' መሆኑን ቼክ ያደርጋል
        if (localStorage.getItem(`pay_status_${key}`) === 'approved') {
            updateUItoOpen(key);
        }
    });
});

// 7. ሎጊን ተግባር (አስፈላጊ ከሆነ)
function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "admin" && password === "1234") {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "about-app.html";
    } else {
        alert("ስህተት! እባክዎ ትክክለኛ መረጃ ያስገቡ።");
    }
}