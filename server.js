require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

// --- 1. Cloudinary Setup (አዲሱ ቁልፍህ ገብቷል) ---
cloudinary.config({
  cloud_name: 'hydroos', 
  api_key: '761546784993472',
  api_secret: '2ky_jDRbmxKsagkX7cL1WtdJ37M' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hydroos_receipts',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// --- 2. Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// ለደህንነት እና ለምስል እይታ የሚሆን CSP
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "img-src * data: blob: https:; " + 
        "style-src * 'unsafe-inline';"
    );
    next();
});

// --- 3. Database Connection ---
const dbURI = process.env.MONGO_URI || 'mongodb+srv://derbewmolla14:1998molla@cluster0.emoozsr.mongodb.net/WaterMonitorDB?retryWrites=true&w=majority';
mongoose.connect(dbURI).then(() => console.log('✅ MongoDB Connected & Cloudinary Configured!'));

const Receipt = mongoose.model('Receipt', new mongoose.Schema({
    url: String, 
    username: String, 
    serviceName: String, 
    name: String, 
    timestamp: { type: Date, default: Date.now }
}));

// --- 4. Routes (መንገዶች) ---

// አድሚን መግቢያ
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === "molla1998") {
        res.json({ success: true, message: "እንኳን ደህና መጡ!" });
    } else {
        res.status(401).json({ success: false, message: "የይለፍ ቃል ስህተት ነው!" });
    }
});

// ምስልን ወደ Cloudinary መላኪያ
app.post('/submit-payment', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "ምስል አልተመረጠም" });

        const { username, serviceName } = req.body;
        const newReceipt = new Receipt({
            url: req.file.path, // Cloudinary የሰጠን HTTPS ሊንክ
            username: username || 'Unknown User',
            serviceName: serviceName || 'General Service',
            name: req.file.filename // Cloudinary Public ID
        });
        await newReceipt.save();
        res.json({ success: true });
    } catch (err) { 
        console.error("Upload Error:", err);
        res.status(500).json({ success: false }); 
    }
});

// ክፍያን ማጽደቂያ (Socket.io)
app.post('/admin/approve-payment', async (req, res) => {
    const { serviceName, username } = req.body;
    io.emit('paymentApproved', { serviceName, username });
    res.json({ success: true });
});

// ክፍያን ውድቅ ማድረጊያ እና ከ Cloudinary ማጥፊያ
app.post('/admin/reject-payment', async (req, res) => {
    try {
        const { serviceName, username, reason } = req.body;
        const deletedReceipt = await Receipt.findOneAndDelete({ username, serviceName });

        if (deletedReceipt) {
            // ምስሉን ከ Cloudinary ላይ ጭምር ያጠፋዋል
            await cloudinary.uploader.destroy(deletedReceipt.name);
        }

        io.emit('paymentRejected', { 
            serviceName, username, 
            reason: reason || "የላኩት ደረሰኝ ትክክል አይደለም። እባክዎ እንደገና ይላኩ።" 
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- ገጾችን መጥሪያ ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'login.html'));
});

app.get('/admin/receipts', async (req, res) => {
    try {
        const receipts = await Receipt.find().sort({ timestamp: -1 });
        res.json(receipts);
    } catch (err) { res.status(500).json([]); }
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'admin-dashboard.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'admin-login.html'));
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', 'HTML', page.endsWith('.html') ? page : `${page}.html`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send("ገጹ አልተገኘም (404 Not Found)");
    }
});

// --- Server Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 HydroOS Live on port ${PORT}`);
});