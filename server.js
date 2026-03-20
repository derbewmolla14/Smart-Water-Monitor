const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const ExcelJS = require('exceljs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// --- 1. Configurations & Middleware ---
app.use(express.json());
app.use(express.static('public'));
app.use('/CSS', express.static(path.join(__dirname, 'public', 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'public', 'JS')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/HTML', express.static(path.join(__dirname, 'public', 'HTML')));

// 📁 የፎልደር ማረጋገጫ (Upload Folder)
const uploadDir = './public/uploads/receipts';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📦 Multer Setup (ከ Route-ዎቹ በፊት መሆን አለበት)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const username = req.body.username ? req.body.username.replace(/\s+/g, '_') : 'unknown';
        cb(null, username + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'login.html'));
});

// 💳 የክፍያ ደረሰኝ መቀበያ API
app.post('/submit-payment', upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "ምንም ፋይል አልተላከም" });
    }
    console.log(`✅ ክፍያ ደርሷል ከ: ${req.body.username}`);
    res.json({ 
        success: true,
        message: "ደረሰኙ ደርሶናል።",
        filePath: `/uploads/receipts/${req.file.filename}` 
    });
});

// 📊 አድሚን ዝርዝር ማሳያ API
app.get('/admin/receipts', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).json({ message: "ስህተት ተፈጥሯል" });
        const fileList = files.map(file => ({
            name: file,
            url: `/uploads/receipts/${file}`
        }));
        res.json(fileList);
    });
});

// 🔐 አድሚን መግቢያ (Login) API
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === "molla1998") {
        res.json({ success: true, message: "እንኳን ደህና መጡ!" });
    } else {
        res.status(401).json({ success: false, message: "የገቡት የይለፍ ቃል የተሳሳተ ነው!" });
    }
});

// 💧 የውሃ መጠን ማዘመኛ
app.get('/update-level', async (req, res) => {
    const level = req.query.level;
    if (!level) return res.status(400).send("Level required.");
    io.emit('levelUpdate', level);
    try {
        const newLog = new WaterLog({ level: Number(level) });
        await newLog.save();
        res.send(`Updated: ${level}%`);
    } catch (error) {
        res.status(500).send("Database Error");
    }
});

// 📑 Excel ሪፖርት ማውረጃ
app.get('/download-excel', async (req, res) => {
    try {
        const logs = await WaterLog.find().sort({ timestamp: -1 });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Water Level History');
        worksheet.columns = [
            { header: 'Level (%)', key: 'level', width: 15 },
            { header: 'Volume (Liters)', key: 'volume', width: 20 },
            { header: 'Date & Time', key: 'timestamp', width: 30 }
        ];
        logs.forEach(log => {
            worksheet.addRow({
                level: log.level,
                volume: (log.level / 100) * 1000,
                timestamp: log.timestamp.toLocaleString()
            });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Water_Level_Report.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).send("ሪፖርቱን ማውጣት አልተቻለም");
    }
});

// 📄 ገጾችን በቀላሉ መጥሪያ
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', 'HTML', page.endsWith('.html') ? page : `${page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) res.status(404).send("ገጹ አልተገኘም");
    });
});

// --- 4. Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 HydroOS Server is Live on http://localhost:${PORT}`);
});