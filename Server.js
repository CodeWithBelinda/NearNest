const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '/')));

let db;

// --- DATABASE INITIALIZATION ---
(async () => {
    try {
        db = await open({
            filename: './nearnest.db',
            driver: sqlite3.Database
        });

        // 1. Create Houses Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS houses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                price INTEGER,
                location TEXT,
                image_url TEXT,
                contact TEXT
            )
        `);

        // 2. Create Inquiries Table (To store potential leads)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                houseId INTEGER,
                userName TEXT,
                phoneNumber TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed sample data if empty
        const count = await db.get('SELECT COUNT(*) as count FROM houses');
        if (count.count === 0) {
            await db.run(
                'INSERT INTO houses (title, price, location, image_url, contact) VALUES (?, ?, ?, ?, ?)',
                ['Vision Suite', 4500, 'vision', 'https://images.unsplash.com/photo-1501183638710-841dd1904471', '0754571779']
            );
            await db.run(
                'INSERT INTO houses (title, price, location, image_url, contact) VALUES (?, ?, ?, ?, ?)',
                ['Cheptulu Market', 3500, 'cheptulu market', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4', '0754571779']
            );
        }

        console.log("✅ Database connected and Nearnest tables ready!");
    } catch (err) {
        console.error("❌ Database initialization failed:", err);
    }
})();

// --- ROUTES ---

// 1. Serve the Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. GET all houses
app.get('/api/houses', async (req, res) => {
    try {
        const houses = await db.all('SELECT * FROM houses');
        res.json(houses);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch houses" });
    }
});

// 3. POST a new inquiry (Saves to Database)
app.post('/api/inquire', async (req, res) => {
    const { houseId, userName, phoneNumber } = req.body;
    
    if (!houseId || !userName || !phoneNumber) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await db.run(
            'INSERT INTO inquiries (houseId, userName, phoneNumber) VALUES (?, ?, ?)',
            [houseId, userName, phoneNumber]
        );
        console.log(`📩 New Inquiry for House #${houseId} from ${userName}`);
        res.json({ success: true, message: "Thank you! Your inquiry has been saved." });
    } catch (err) {
        res.status(500).json({ error: "Failed to save inquiry" });
    }
});

// 4. POST a new house (Admin helper)
app.post('/api/houses', async (req, res) => {
    const { title, price, location, image_url, contact } = req.body;
    try {
        await db.run(
            'INSERT INTO houses (title, price, location, image_url, contact) VALUES (?, ?, ?, ?, ?)',
            [title, price, location, image_url, contact]
        );
        res.json({ success: true, message: "House added successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add house" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Nearnest Server running at http://localhost:${PORT}`);
});