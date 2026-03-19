const translations = {
    am: {
        "app-title": "ስለ Smart Water Monitor",
        "how-it-works-title": "ሲስተሙ እንዴት ይሰራል?",
        "app-intro": "ይህ ሲስተም የውሃ ማጠራቀሚያ ታንከሮችን መጠን በዘመናዊ መንገድ ለመቆጣጠር ታስቦ የተሰራ ነው።",
        "hw-desc": "በታንከሩ አናት ላይ የሚገጠመው Ultrasonic Sensor የውሃውን ርቀት ይለካል።",
        "srv-desc": "ESP32 መረጃውን በ Wi-Fi አማካኝነት ለ Node.js ሰርቨር ይልካል።",
        "web-desc-list": "ተጠቃሚው በየትኛውም ቦታ ሆኖ በድረ-ገጹ ላይ የውሃውን መጠን በፐርሰንት (%) ያያል።",
        "video-title": "የአጠቃቀም መመሪያ ቪዲዮ",
        "web-title": "የድረ-ገጹ (Web) ልዩ ባህሪያት",
        "feat-1-h": "Real-time Update",
        "feat-1-p": "መረጃው በቅጽበት (ያለ Refresh) ይቀየራል።",
        "feat-2-h": "Excel Reports",
        "feat-2-p": "የውሃ ፍጆታ ታሪክን በ Excel ማውረድ ይቻላል።",
        "feat-3-h": "Mobile Friendly",
        "feat-3-p": "በስልክም ሆነ በኮምፒውተር ለመጠቀም ይመቻል።",
        "academy-link": "አሀዱ ቴክ አካዳሚ",
        "phone-text": "ለበለጠ መረጃ ይደውሉልን፦",
        "footer-text": "© 2026 አሀዱ ቴክ አካዳሚ። መብቱ በህግ የተጠበቀ ነው።",
        "social-heading": "ሁሉንም ይከተሉ"
    },
    en: {
        "app-title": "About Smart Water Monitor",
        "how-it-works-title": "How it Works",
        "app-intro": "This system is designed to monitor water tank levels modernly.",
        "hw-desc": "Ultrasonic Sensor mounted on top measures water distance.",
        "srv-desc": "ESP32 sends data to Node.js server via Wi-Fi.",
        "web-desc-list": "Users can see water level in percentage (%) from anywhere.",
        "video-title": "User Guide Videos",
        "web-title": "Web Dashboard Features",
        "feat-1-h": "Real-time Update",
        "feat-1-p": "Updates instantly without refreshing the page.",
        "feat-2-h": "Excel Reports",
        "feat-2-p": "Download water consumption history in Excel.",
        "feat-3-h": "Mobile Friendly",
        "feat-3-p": "Perfectly fits both mobile and desktop screens.",
        "academy-link": "Ahadu Tech Academy",
        "phone-text": "Contact us for more info:",
        "footer-text": "© 2026 Ahadu Tech Academy. All Rights Reserved.",
        "social-heading": "Follow us on all platforms"
    }
};

function changeLang(lang) {
    console.log("Changing language to: " + lang); 
    for (let id in translations[lang]) {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = translations[lang][id];
        }
    }
    localStorage.setItem('selectedLang', lang);
}

// ገጹ ሲከፈት ቋንቋ እና ሎጊን ቼክ ማድረግ
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem('selectedLang') || 'am';
    changeLang(savedLang);

    if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("ይህንን ገጽ ለማግኘት እባክዎ መጀመሪያ ይግቡ!");
        window.location.href = "login.html";
    }
});

// --- አዲስ የተጨመሩ የክፍያ ፈንክሽኖች ---

// function openPaymentModal() {
//     document.getElementById("paymentModal").style.display = "block";
// }

// function closeModal() {
//     document.getElementById("paymentModal").style.display = "none";
// }

// async function processChapa(method) {
//     const email = localStorage.getItem("loggedUser");
//     const firstName = localStorage.getItem("loggedUserName") || "Customer";
    
//     try {
//         const response = await fetch('/initialize-payment', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 email: email,
//                 amount: 100,
//                 first_name: firstName,
//                 service: "Tanker Monitor",
//                 method: method 
//             })
//         });

//         const data = await response.json();
        
//         if (data.checkout_url) {
//             window.location.href = data.checkout_url;
//         } else {
//             alert("ክፍያ መጀመር አልተቻለም");
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         // ሰርቨሩ Render ላይ ተኝቶ ከሆነ ወይም ግንኙነት ከሌለ ለሙከራ እንዲሰራ፦
//         alert(method + " ክፍያ ተሳክቷል! ወደ ዳሽቦርድ እየወሰድንዎት ነው...");
//         window.location.href = "index.html";
//     }
// }

function processChapa(method) {
    // 1. ለተጠቃሚው መመሪያ መስጠት
    const message = `ውድ ደንበኛችን፣ ${method} መርጠዋል።\n\nእባክዎ 100 ብር ወደ +251937100547 በቴሌብር ይላኩ።\n\nብር መላክዎን የሚያረጋግጥ የደረሰኝ ፎቶ (Screenshot) በቴሌግራም @MollaDebew (ወይም በስልክ ቁጥራችን) ይላኩልን።\n\nአመሰግናለን!`;
    
    alert(message);
    
    // 2. ለጊዜው ክፍያውን እንደፈጸመ ቆጥሮ ወደ ዳሽቦርድ እንዲያልፍ ማድረግ
    // ማሳሰቢያ፡ ለወደፊት በ Chapa ስታስተካክለው ይህ መስመር ይቀየራል
    console.log(`${method} ክፍያ በሂደት ላይ ነው...`);
    
    setTimeout(() => {
        window.location.href = "index.html"; 
    }, 500);
}