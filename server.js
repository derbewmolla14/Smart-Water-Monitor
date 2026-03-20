
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
// እነዚህ በ server.js ውስጥ መኖራቸውን እርግጠኛ ሁን
app.use(express.static('public'));
app.use('/CSS', express.static(path.join(__dirname, 'public', 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'public', 'JS')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/HTML', express.static(path.join(__dirname, 'public', 'HTML')));

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

const ExcelJS = require('exceljs'); // ከላይ መኖሩን አረጋግጥ

app.get('/download-excel', async (req, res) => {
    try {
        // 1. ዳታውን ከ MongoDB አውጣ
        const logs = await WaterLog.find().sort({ timestamp: -1 });

        // 2. አዲስ Excel Workbook ፍጠር
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Water Level History');

        // 3. የሰንጠረዡ ራስጌ (Headers)
        worksheet.columns = [
            { header: 'Level (%)', key: 'level', width: 15 },
            { header: 'Volume (Liters)', key: 'volume', width: 20 },
            { header: 'Date & Time', key: 'timestamp', width: 30 }
        ];

        // 4. ዳታውን አስገባ
        logs.forEach(log => {
            worksheet.addRow({
                level: log.level,
                volume: (log.level / 100) * 1000, // 1000L ታንከር ከሆነ
                timestamp: log.timestamp.toLocaleString()
            });
        });

        // 5. ፋይሉን ለተጠቃሚው ላክ
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Water_Level_Report.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Excel Error:", error);
        res.status(500).send("ሪፖርቱን ማውጣት አልተቻለም");
    }
});
// --- 4. Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 HydroOS Server is Live!`);
    console.log(`🔗 Local Link: http://localhost:${PORT}`);
});


const multer = require('multer');
const path = require('path');

// ፎቶው የሚቀመጥበት ቦታ (uploads ፎልደር ውስጥ)
const storage = multer.diskStorage({
    destination: './uploads/receipts/',
    filename: function(req, file, cb) {
        cb(null, req.body.username + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ደረሰኝ መቀበያ API
app.post('/submit-payment', upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "ምንም ፋይል አልተላከም" });
    }

    // እዚህ ጋር በዳታቤዝህ ውስጥ የክፍያውን ሁኔታ (Pending) መመዝገብ ትችላለህ
    console.log(`ክፍያ መጥቷል ከ: ${req.body.username} ለ: ${req.body.serviceName}`);
    
    res.json({ success: true,
                message: "ደረሰኙ ደርሶናል።",
                filePath: `/uploads/receipts/${req.file.filename}` });
});

const fs = require('fs');
const uploadDir = './public/uploads/receipts';

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const fs = require('fs');

// ሁሉንም ደረሰኞች ለይቶ የሚያወጣ API
app.get('/admin/receipts', (req, res) => {
    const directoryPath = './public/uploads/receipts';
    
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send({ message: "ፋይሎቹን ማግኘት አልተቻለም" });
        }
        
        // የፋይሎቹን ዝርዝር ወደ Frontend መላክ
        const fileList = files.map(file => ({
            name: file,
            url: `/uploads/receipts/${file}`
        }));
        res.json(fileList);
    });
});


// አድሚን መግቢያ (Login) API
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = "your_secret_password"; // እዚህ ጋር የፈለግኸውን ሚስጥራዊ ቃል ቀይር

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: "እንኳን ደህና መጡ!" });
    } else {
        res.status(401).json({ success: false, message: "የገቡት የይለፍ ቃል የተሳሳተ ነው!" });
    }
});