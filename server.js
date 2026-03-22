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
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

// --- 1. Middleware (ሁልጊዜ ከሁሉም በላይ መሆን አለባቸው) ---
app.use(express.json());
app.use(express.static('public'));
// server.js ላይ ከሌሎች app.use ጋር ይጨምሩ
// server.js ውስጥ static folder መፍቀድ
// እነዚህን ሁለት መስመሮች በ server.js ላይ ይተኳቸው
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// CSP Header - ብሮውዘሩ እንዳይከለክል
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

// --- 2. Multer & DB Setup ---
const uploadDir = path.join(__dirname, 'public', 'uploads', 'receipts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

const dbURI = process.env.MONGO_URI || 'mongodb+srv://derbewmolla14:1998molla@cluster0.emoozsr.mongodb.net/WaterMonitorDB?retryWrites=true&w=majority';
mongoose.connect(dbURI).then(() => console.log('✅ MongoDB Connected!'));

const Receipt = mongoose.model('Receipt', new mongoose.Schema({
    url: String, username: String, serviceName: String, name: String, timestamp: { type: Date, default: Date.now }
}));

// --- 3. Routes (መንገዶች) ---

// አድሚን መግቢያ (ከ ገጾቹ በላይ መሆን አለበት)
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === "molla1998") {
        res.json({ success: true, message: "እንኳን ደህና መጡ!" });
    } else {
        res.status(401).json({ success: false, message: "የይለፍ ቃል ስህተት ነው!" });
    }
});

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
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/admin/approve-payment', async (req, res) => {
    const { serviceName, username } = req.body;
    io.emit('paymentApproved', { serviceName, username });
    res.json({ success: true });
});
// ❌ ክፍያን ውድቅ ማድረጊያ API
app.post('/admin/reject-payment', async (req, res) => {
    try {
        const { serviceName, username, reason } = req.body;
        // 1. ደረሰኙን ከ MongoDB መፈለግና ማጥፋት (Delete)
        // ማሳሰቢያ፡ username እና serviceName በትክክል መመሳሰል አለባቸው
        const deletedReceipt = await Receipt.findOneAndDelete({ 
            username: username, 
            serviceName: serviceName 
        });

        if (deletedReceipt) {
            console.log(`ደረሰኝ ተሰርዟል፦ ${deletedReceipt.url}`);
            
            // (አማራጭ) ፋይሉን ከ 'uploads' ፎልደር ውስጥም ጭምር ማጥፋት ከፈለግህ፦
            const filePath = path.join(__dirname, 'public', deletedReceipt.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
            }
        }
        //2. ለተጠቃሚው በ Socket.io መልዕክት መላክ
        io.emit('paymentRejected', { 
            serviceName, 
            username, 
            reason: reason || "የላኩት ደረሰኝ ትክክል አይደለም። እባክዎ እንደገና ይላኩ።" 
        });

        res.json({ success: true, message: "ውድቅ ተደርጓል" });
    } catch (err) {
        console.error("Reject Error:", err);
        res.status(500).json({ success: false, message: "ማጥፋት አልተቻለም" });
    }
});

// ገጾችን መጥሪያ (ሁልጊዜ ከ API-ዎቹ በታች መሆን አለበት)
// // ዋናው ገጽ (Home Page) ሲከፈት about-app እንዲመጣ
// server.js ውስጥ መኖሩን አረጋግጥ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'login.html'));
});
// ከዳታቤዝ ሁሉንም ደረሰኞች አምጥቶ ለአድሚን መላክ
app.get('/admin/receipts', async (req, res) => {
    try {
        const receipts = await Receipt.find().sort({ timestamp: -1 });
        console.log("የተገኙ ደረሰኞች ብዛት፦", receipts.length); // ተርሚናል ላይ ይቆጥራል
        res.json(receipts);
    } catch (err) {
        console.error("መረጃ ማምጣት አልተቻለም፦", err);
        res.status(500).json([]);
    }
});
// 1. ለአድሚን ዳሽቦርድ የሚሆን ቀጥተኛ መንገድ (Path)
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'admin-dashboard.html'));
});

// 2. ለአድሚን ሎግኢን የሚሆን ቀጥተኛ መንገድ
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'admin-login.html'));
});

// 3. ሌሎችን ገጾች በስም ለመጥራት (ይህ ከሁለቱ በታች ይሁን)
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', 'HTML', page.endsWith('.html') ? page : `${page}.html`);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send("ገጹ አልተገኘም (404 Not Found)");
    }
});
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'login.html'));
});
// ለጥንቃቄ ደግሞ ያለ .html እንዲሰራ ይህን ይጨምሩ
// --- 4. Start Server (ሁልጊዜ ከሁሉም በታች መጨረሻ ላይ) ---
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 HydroOS Live on http://localhost:${PORT}`);
});

