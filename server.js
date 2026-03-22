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
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const uploadDir = path.join(__dirname, 'public', 'uploads', 'receipts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 📦 Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // ፋይሉን በጊዜ ስም ብቻ ሴቭ እናድርገው (req.body ገና ዝግጁ ስላልሚሆን)
        cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// --- MongoDB Schemas ---
const dbURI = process.env.MONGO_URI || 'mongodb+srv://derbewmolla14:1998molla@cluster0.emoozsr.mongodb.net/WaterMonitorDB?retryWrites=true&w=majority';
mongoose.connect(dbURI).then(() => console.log('✅ MongoDB Connected!'));

const WaterLog = mongoose.model('WaterLog', new mongoose.Schema({ level: Number, timestamp: { type: Date, default: Date.now } }));

// 🌟 ይህ ሞዴል መኖር አለበት!
const Receipt = mongoose.model('Receipt', new mongoose.Schema({
    url: String,
    username: String,
    serviceName: String,
    name: String,
    timestamp: { type: Date, default: Date.now }
}));

// --- Routes ---
app.post('/submit-payment', upload.single('receipt'), async (req, res) => {
    try {
        const { username, serviceName } = req.body;
        const newReceipt = new Receipt({
            url: `/uploads/receipts/${req.file.filename}`,
            username: username || 'Unknown User',
            serviceName: serviceName || 'General Service',
            name: req.file.filename
        });
        await newReceipt.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/admin/receipts', async (req, res) => {
    try {
        const receipts = await Receipt.find().sort({ timestamp: -1 });
        res.json(receipts);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.post('/admin/approve-payment', async (req, res) => {
    const { serviceName, username } = req.body;
    io.emit('paymentApproved', { serviceName, username });
    res.json({ success: true });
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'public', 'HTML', page.endsWith('.html') ? page : `${page}.html`));
});

server.listen(3000, () => console.log(`🚀 HydroOS Live on http://localhost:3000`));
// CSP Header ማስተካከያ - ሁሉንም ግንኙነቶች እንዲፈቅድ
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "script-src * 'unsafe-inline' 'unsafe-eval'; " +
        "connect-src * 'unsafe-inline'; " +
        "img-src * data: blob:; " +
        "style-src * 'unsafe-inline';"
    );
    next();
});
// 🔐 አድሚን መግቢያ (Login) API
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    
    // በኮንሶል ላይ ዳታው መምጣቱን እንፈትሽ
    console.log("የመጣው የይለፍ ቃል፦", password);

    if (password === "molla1998") {
        return res.json({ success: true, message: "እንኳን ደህና መጡ!" });
    } else {
        return res.status(401).json({ success: false, message: "የገቡት የይለፍ ቃል የተሳሳተ ነው!" });
    }
});