const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. የ Frontend ፋይሎች እንዲታዩ
app.use(express.static('public'));

// 2. ከዳታቤዝ ጋር መገናኘት
mongoose.connect('mongodb://localhost:27017/waterMonitor')
  .then(() => console.log('✅ ዳታቤዝ ተገናኝቷል!'))
  .catch(err => console.error('❌ የዳታቤዝ ግንኙነት አልተሳካም:', err));

// 3. የዳታ አወቃቀር (Schema)
const waterLogSchema = new mongoose.Schema({
    level: Number,
    timestamp: { type: Date, default: Date.now }
});
const WaterLog = mongoose.model('WaterLog', waterLogSchema);

// 4. መረጃ መቀበያ (Update Level)
app.get('/update-level', async (req, res) => {
    const level = req.query.level;

    if (!level) {
        return res.status(400).send("እባክህ የውሃ መጠን (level) ጨምር!");
    }

    console.log("ከሴንሰሩ የመጣ መረጃ:", level);

    try {
        // ለዳሽቦርዱ በ Socket.io ወዲያውኑ ላክ
        io.emit('levelUpdate', level);

        // ዳታቤዝ ውስጥ አስቀምጥ
        if (mongoose.connection.readyState === 1) {
            const newLog = new WaterLog({ level: level });
            await newLog.save();
        }

        res.send(`ዳታው ደርሶናል: ${level}%`);
    } catch (error) {
        console.error("ስህተት:", error);
        res.status(500).send("የውስጥ ሰርቨር ስህተት");
    }
});

// 5. Excel ማውረጃ
app.get('/download-excel', async (req, res) => {
    try {
        const data = await WaterLog.find().sort({ timestamp: -1 });

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Water Logs');

        worksheet.columns = [
            { header: 'ቀን እና ሰዓት', key: 'timestamp', width: 25 },
            { header: 'የውሃ መጠን (%)', key: 'level', width: 15 },
            { header: 'ሁኔታ', key: 'status', width: 15 }
        ];

        if (data.length > 0) {
            data.forEach(log => {
                worksheet.addRow({
                    timestamp: log.timestamp ? log.timestamp.toLocaleString('am-ET') : 'N/A',
                    level: log.level,
                    status: log.level < 20 ? 'ዝቅተኛ' : 'በቂ'
                });
            });
        } else {
            worksheet.addRow({ timestamp: 'ምንም ዳታ የለም', level: '-', status: '-' });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=WaterMonitor_Report.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Excel Error:", error);
        res.status(500).send("Excel ፋይሉን ማዘጋጀት አልተቻለም። ስህተት፦ " + error.message);
    }
});

// 6. ሰርቨሩን ማስነሻ (ሁልጊዜ መጨረሻ ላይ ይሁን)
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 ሰርቨሩ በ http://localhost:${PORT} ላይ በሰላም ተነስቷል!`);
});