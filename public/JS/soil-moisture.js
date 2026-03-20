
        function toggleTheme(mode) {
            const body = document.getElementById('main-body');
            if (mode === 'light') {
                body.classList.add('light-mode');
            } else {
                body.classList.remove('light-mode');
            }
        }

        const translations = {
            am: {
                back: "ወደ ዋናው ገጽ",
                h_title: "ዘመናዊ የቆጣቢ መስኖ ሲስተም",
                h_def: "ዘመናዊ የመስኖ ሥርዓት ማለት የላቁ ሴንሰሮችን (Sensors) በመጠቀም የአፈርን እርጥበት መጠን በቅጽበት (Real-time) በመለካት፣ ተክሎች የሚያስፈልጋቸውን ትክክለኛ የውሃ መጠን ብቻ በራሱ (Automatically) እንዲያገኙ የሚያደርግ ቴክኖሎጂ ነው። ይህም የውሃ ብክነትን ከመቀነሱም በላይ የሰብል ምርታማነትን በከፍተኛ ሁኔታ ይጨምራል።",
                h_desc: "የአፈርን እርጥበት በመለካት ውሃን በቁጠባ እና በብልሃት ለተክሎች ማቅረብ",
                p1: "ዘመናዊ መስኖ", p2: "የተክሎች እድገት",
                c1: "የአፈር እርጥበት መጠን", c2: "የፓምፕ ሁኔታ",
            },
            en: {
                back: "Back to Services",
                h_title: "Smart Irrigation System",
                h_def: "Smart Irrigation System is a technology that uses advanced sensors to measure soil moisture in real-time, ensuring plants receive only the precise amount of water they need automatically. This reduces water wastage and significantly increases crop productivity.",
                h_desc: "Measuring soil moisture to provide water efficiently to plants",
                p1: "Smart Irrigation", p2: "Plant Growth",
                c1: "Soil Moisture Level", c2: "Pump Status"
            }
        };

        function changeLang(lang) {
            document.getElementById('back-btn').innerHTML = `<i class="fas fa-arrow-left"></i> ${translations[lang].back}`;
            document.getElementById('header-title').innerText = translations[lang].h_title;
            document.getElementById('header-def').innerText = translations[lang].h_def;
            document.getElementById('header-desc').innerText = translations[lang].h_desc;
            document.getElementById('plant-1').innerText = translations[lang].p1;
            document.getElementById('plant-2').innerText = translations[lang].p2;
            document.getElementById('card1-title').innerText = translations[lang].c1;
            document.getElementById('card2-title').innerText = translations[lang].c2;
        }

        setInterval(() => {
            let moisture = Math.floor(Math.random() * 100);
            document.getElementById("moisture-val").innerText = moisture + "%";
            const statusText = document.getElementById("pump-status");
            const pumpLabel = document.getElementById("pump-label");

            if (moisture < 35) {
                statusText.innerText = "ሁኔታ: ፑምፑ ክፍት ነው (ON)";
                statusText.style.color = "#2ecc71";
                pumpLabel.innerText = "ON";
                pumpLabel.style.background = "#2ecc71";
            } else {
                statusText.innerText = "ሁኔታ: ክትትል ላይ (OFF)";
                statusText.style.color = "#f1c40f";
                pumpLabel.innerText = "OFF";
                pumpLabel.style.background = "#e74c3c";
            }
        }, 4000);
 