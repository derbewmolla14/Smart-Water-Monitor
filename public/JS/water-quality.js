
    const qualityTranslations = {
        am: {
            "main-t": "Water Quality Dashboard",
            "sub-t": "የኬሚካል እና ባዮሎጂካል ይዘት ምርመራ",
            "ph-l": "የ pH መጠን",
            "turb-l": "የውሃ ንጽህና (Turbidity)",
            "bac-l": "ባክቴሪያ መኖሩ",
            "back-b": "ወደ ዋናው ገጽ ተመለስ"
        },
        en: {
            "main-t": "Water Quality Dashboard",
            "sub-t": "Real-time Chemical & Biological Analysis",
            "ph-l": "pH Level",
            "turb-l": "Turbidity",
            "bac-l": "Bacteria Detection",
            "back-b": "Back to Home"
        }
    };

    function changeQualLang(lang) {
        document.querySelector('.quality-header h1').innerText = qualityTranslations[lang]["main-t"];
        document.querySelector('.quality-header p').innerText = qualityTranslations[lang]["sub-t"];
        const labels = document.querySelectorAll('.label');
        labels[0].innerText = qualityTranslations[lang]["ph-l"];
        labels[1].innerText = qualityTranslations[lang]["turb-l"];
        labels[2].innerText = qualityTranslations[lang]["bac-l"];
        document.querySelector('.back-btn').innerText = qualityTranslations[lang]["back-b"];
    }