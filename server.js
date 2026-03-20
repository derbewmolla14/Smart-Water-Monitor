
// // 1. ሰዓት እና ቀን በየሰከንዱ እንዲታደስ የሚያደርግ ፈንክሽን
// function updateDateTime() {
//     const now = new Date();
//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
//     document.getElementById('date-time').innerText = now.toLocaleDateString('en-US', options);
// }

// // 2. የውሃውን መጠን በዳሽቦርዱ ላይ ለመቀየር የሚያገለግል ፈንክሽን
// function updateWaterLevel(percent) {
//     // ከ 0 እስከ 100 መሆኑን ማረጋገጥ
//     if (percent < 0) percent = 0;
//     if (percent > 100) percent = 100;

//     // በ HTML ላይ ያሉትን ክፍሎች ማግኘት
//     const waterElement = document.getElementById('water-level');
//     const percentText = document.getElementById('percent-val');
//     const volumeText = document.getElementById('volume-val');

//     // ግራፊክሱን መቀየር
//     waterElement.style.height = percent + "%";
    
//     // ጽሁፉን መቀየር
//     percentText.innerText = percent;
    
//     // የሊትር መጠን ማስላት (ለምሳሌ ታንከሩ 1000 ሊትር ቢሆን)
//     const totalVolume = 1000;
//     const currentVolume = (percent / 100) * totalVolume;
//     volumeText.innerText = currentVolume;
// }

// // 3. በየሰከንዱ ሰዓቱን አድስ
// setInterval(updateDateTime, 1000);

// // ለሙከራ ያህል፡ ከ 3 ሰከንድ በኋላ የውሃውን መጠን ወደ 85% ቀይረው
// setTimeout(() => {
//     updateWaterLevel(85);
// }, 3000);


// const socket = io();

// // ሰርቨሩ 'levelUpdate' የሚል መረጃ ሲልክልን ተቀበል
// socket.on('levelUpdate', (newLevel) => {
//     updateWaterLevel(newLevel); // ቀደም ብለን የሰራነው ፈንክሽን
// });

// /*
// 1. MongoDB Setup
// መጀመሪያ ኮምፒውተርህ ላይ MongoDB መጫን ወይም የኦንላይን አገልግሎቱን (MongoDB Atlas) መጠቀም ትችላለህ። በመቀጠል በፕሮጀክትህ ውስጥ አስፈላጊውን ጥቅል (Package) ጫን፦

// Bash
// npm install mongoose
// 2. ዳታውን እንዴት እንደምናስቀምጥ (Schema)
// መረጃው በዳታቤዝ ውስጥ በምን አይነት መልክ ይቀመጥ የሚለውን መወሰን አለብን። በ server.js ፋይልህ ላይ የሚከተለውን Schema ጨምር፦
// */

// // const mongoose = require('mongoose');

// // // ከዳታቤዝ ጋር መገናኘት
// // mongoose.connect('mongodb://localhost:27017/waterMonitor')
// //   .then(() => console.log('ዳታቤዝ ተገናኝቷል!'))
// //   .catch(err => console.error('ግንኙነት አልተሳካም:', err));

// // // የዳታ አወቃቀር (Schema)
// // const waterLogSchema = new mongoose.Schema({
// //     level: Number,
// //     timestamp: { type: Date, default: Date.now }
// // });

// // const WaterLog = mongoose.model('WaterLog', waterLogSchema);



// // 3. ዳታውን መቀበል እና ማስቀመጥ
// // ቅድም የሰራነውን /update-level የሚለውን መንገድ (Route) በማሻሻል፣ መረጃው ሲመጣ ወደ ዳታቤዝ እንዲገባ እናደርጋለን፦
// app.get('/update-level', async (req, res) => {
//     const level = req.query.level;

//     try {
//         // 1. መረጃውን ዳታቤዝ ውስጥ መመዝገብ
//         const newLog = new WaterLog({ level: level });
//         await newLog.save();

//         // 2. ለዳሽቦርዱ በ Real-time መላክ
//         io.emit('levelUpdate', level);

//         res.status(200).send("ዳታው ተመዝግቧል!");
//     } catch (error) {
//         res.status(500).send("ስህተት ተፈጥሯል");
//     }
// });

// // 4. የቆየ ዳታን (History) ማሳየት
// // አሁን ደግሞ ዳሽቦርድህ ሲከፈት ያለፉትን 24 ሰዓታት መረጃ እንዲያሳይ አዲስ መንገድ (API Endpoint) እንፈጥራለን፦
// app.get('/get-history', async (req, res) => {
//     // የመጨረሻዎቹን 20 መዝገቦች አውጣ
//     const history = await WaterLog.find().sort({ timestamp: -1 }).limit(20);
//     res.json(history);
// });

// document.addEventListener("DOMContentLoaded", () => {
//     if (localStorage.getItem("isLoggedIn") !== "true") {
//         window.location.href = "login.html";
//     } else {
//         // የተጠቃሚውን ስም በዳሽቦርዱ ላይ ለማሳየት (ከተፈለገ)
//         const userName = localStorage.getItem("loggedUserName");
//         console.log("Welcome " + userName);
//     }

    
// });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// --- 1. Static Files (CSS, JS, Images እንዲሰሩ) ---
// ይህ መስመር ብራውዘሩ በ public ውስጥ ያሉትን CSS, JS እና images ፎልደሮች እንዲያገኝ ያደርጋል
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// --- 2. MongoDB Connection ---
const dbURI = process.env.MONGO_URI || 'mongodb+srv://derbewmolla14:1998molla@cluster0.emoozsr.mongodb.net/WaterMonitorDB?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch(err => console.error('❌ DB Error:', err));

const WaterLog = mongoose.model('WaterLog', new mongoose.Schema({
    level: Number,
    timestamp: { type: Date, default: Date.now }
}));

// --- 3. Routes (መንገዶች) ---

// ዌብሳይቱ ሲከፈት (/) በቀጥታ HTML ፎልደር ውስጥ ያለውን login.html እንዲያሳይ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'login.html'));
});

// ሌሎች የHTML ገጾችን ከ HTML ፎልደር ውስጥ በቀላሉ ለመጥራት
// ለምሳሌ፡ your-site.com/about-app ብለህ ስትጽፍ about-app.html ይከፈታል
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', 'HTML', page.endsWith('.html') ? page : `${page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send("ገጹ አልተገኘም (Page not found)");
        }
    });
});

// አዳዲስ የውሃ መጠን መረጃዎችን ለመቀበል
app.get('/update-level', async (req, res) => {
    const level = req.query.level;
    if (!level) return res.status(400).send("Level required. Use: /update-level?level=80");
    
    io.emit('levelUpdate', level);

    try {
        const newLog = new WaterLog({ level: Number(level) });
        await newLog.save();
        res.send(`Updated: ${level}% and saved to Database.`);
    } catch (error) {
        res.status(500).send("Database Error");
    }
});

// የቆየ ዳታ ታሪክን ለማውጣት
app.get('/get-history', async (req, res) => {
    try {
        const history = await WaterLog.find().sort({ timestamp: -1 }).limit(20);
        res.json(history);
    } catch (error) {
        res.status(500).send("Error fetching history");
    }
});

// --- 4. Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 HydroOS Server is Live!`);
    console.log(`🔗 Local Link: http://localhost:${PORT}`);
});