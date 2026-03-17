// 1. ሰዓት እና ቀን በየሰከንዱ እንዲታደስ የሚያደርግ ፈንክሽን
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('date-time').innerText = now.toLocaleDateString('am-ET', options);
}

// 2. የውሃውን መጠን በዳሽቦርዱ ላይ ለመቀየር የሚያገለግል ፈንክሽን
function updateWaterLevel(percent) {
    // ከ 0 እስከ 100 መሆኑን ማረጋገጥ
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    // በ HTML ላይ ያሉትን ክፍሎች ማግኘት
    const waterElement = document.getElementById('water-level');
    const percentText = document.getElementById('percent-val');
    const volumeText = document.getElementById('volume-val');

    // ግራፊክሱን መቀየር
    waterElement.style.height = percent + "%";
    
    // ጽሁፉን መቀየር
    percentText.innerText = percent;
    
    // የሊትር መጠን ማስላት (ለምሳሌ ታንከሩ 1000 ሊትር ቢሆን)
    const totalVolume = 1000;
    const currentVolume = (percent / 100) * totalVolume;
    volumeText.innerText = currentVolume;
}

// 3. በየሰከንዱ ሰዓቱን አድስ
setInterval(updateDateTime, 1000);

// ለሙከራ ያህል፡ ከ 3 ሰከንድ በኋላ የውሃውን መጠን ወደ 85% ቀይረው
setTimeout(() => {
    updateWaterLevel(85);
}, 3000);


const socket = io();

// ሰርቨሩ 'levelUpdate' የሚል መረጃ ሲልክልን ተቀበል
socket.on('levelUpdate', (newLevel) => {
    updateWaterLevel(newLevel); // ቀደም ብለን የሰራነው ፈንክሽን
});

/*
1. MongoDB Setup
መጀመሪያ ኮምፒውተርህ ላይ MongoDB መጫን ወይም የኦንላይን አገልግሎቱን (MongoDB Atlas) መጠቀም ትችላለህ። በመቀጠል በፕሮጀክትህ ውስጥ አስፈላጊውን ጥቅል (Package) ጫን፦

Bash
npm install mongoose
2. ዳታውን እንዴት እንደምናስቀምጥ (Schema)
መረጃው በዳታቤዝ ውስጥ በምን አይነት መልክ ይቀመጥ የሚለውን መወሰን አለብን። በ server.js ፋይልህ ላይ የሚከተለውን Schema ጨምር፦
*/

// const mongoose = require('mongoose');

// // ከዳታቤዝ ጋር መገናኘት
// mongoose.connect('mongodb://localhost:27017/waterMonitor')
//   .then(() => console.log('ዳታቤዝ ተገናኝቷል!'))
//   .catch(err => console.error('ግንኙነት አልተሳካም:', err));

// // የዳታ አወቃቀር (Schema)
// const waterLogSchema = new mongoose.Schema({
//     level: Number,
//     timestamp: { type: Date, default: Date.now }
// });

// const WaterLog = mongoose.model('WaterLog', waterLogSchema);



// 3. ዳታውን መቀበል እና ማስቀመጥ
// ቅድም የሰራነውን /update-level የሚለውን መንገድ (Route) በማሻሻል፣ መረጃው ሲመጣ ወደ ዳታቤዝ እንዲገባ እናደርጋለን፦
app.get('/update-level', async (req, res) => {
    const level = req.query.level;

    try {
        // 1. መረጃውን ዳታቤዝ ውስጥ መመዝገብ
        const newLog = new WaterLog({ level: level });
        await newLog.save();

        // 2. ለዳሽቦርዱ በ Real-time መላክ
        io.emit('levelUpdate', level);

        res.status(200).send("ዳታው ተመዝግቧል!");
    } catch (error) {
        res.status(500).send("ስህተት ተፈጥሯል");
    }
});

// 4. የቆየ ዳታን (History) ማሳየት
// አሁን ደግሞ ዳሽቦርድህ ሲከፈት ያለፉትን 24 ሰዓታት መረጃ እንዲያሳይ አዲስ መንገድ (API Endpoint) እንፈጥራለን፦
app.get('/get-history', async (req, res) => {
    // የመጨረሻዎቹን 20 መዝገቦች አውጣ
    const history = await WaterLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(history);
});