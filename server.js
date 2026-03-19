const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- 1. Middleware ---
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. Database Connection ---
const dbURI = process.env.MONGO_URI || 'mongodb+srv://derbewmolla14:1998molla@cluster0.emoozsr.mongodb.net/WaterMonitorDB?retryWrites=true&w=majority';

mongoose.connect(dbURI)
  .then(() => console.log('✅ Database Connected!'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// --- 3. Data Schema ---
const waterLogSchema = new mongoose.Schema({
    level: Number,
    timestamp: { type: Date, default: Date.now }
});
const WaterLog = mongoose.model('WaterLog', waterLogSchema);

// --- 4. Chapa Payment Integration ---
app.post('/initialize-payment', async (req, res) => {
    const { email, amount, first_name, service } = req.body;
    const TX_REF = "TX-" + Date.now();

    try {
        const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
            amount: amount,
            currency: "ETB",
            email: email,
            first_name: first_name,
            tx_ref: TX_REF,
            return_url: "https://smart-water-monitor-7kui.onrender.com/index.html", 
            callback_url: "https://smart-water-monitor-7kui.onrender.com/verify-payment/" + TX_REF,
            customization: { title: service, description: "Payment for " + service }
        }, {
            headers: { Authorization: `Bearer CHASECK_TEST-xxxxxxxxxxxx` } // የ Chapa Key እዚህ ይግባ
        });
        res.json(response.data.data); 
    } catch (error) {
        res.status(500).json({ error: "ክፍያ መጀመር አልተቻለም" });
    }
});

// --- 5. Sensor Update Level Route ---
app.get('/update-level', async (req, res) => {
    const level = req.query.level;
    if (!level) return res.status(400).send("Level is required!");

    io.emit('levelUpdate', level);

    try {
        const newLog = new WaterLog({ level: level });
        await newLog.save();
        res.send(`Data Saved: ${level}%`);
    } catch (error) {
        res.status(500).send("Database Error");
    }
});

// --- 6. Get History (ለግራፍ ወይም ለዝርዝር) ---
app.get('/get-history', async (req, res) => {
    try {
        const history = await WaterLog.find().sort({ timestamp: -1 }).limit(20);
        res.json(history);
    } catch (error) {
        res.status(500).send("Error fetching history");
    }
});

// --- 7. Excel Download ---
app.get('/download-excel', async (req, res) => {
    try {
        const data = await WaterLog.find().sort({ timestamp: -1 });
        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Water Logs');
        worksheet.columns = [
            { header: 'Date', key: 'timestamp', width: 25 },
            { header: 'Level (%)', key: 'level', width: 15 }
        ];
        data.forEach(log => worksheet.addRow({ timestamp: log.timestamp.toLocaleString(), level: log.level }));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=WaterReport.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).send("Excel Error");
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
