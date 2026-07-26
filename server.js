require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '.uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '.uploads')));

// Serve the frontend web pages natively (bypasses Live Server entirely)
app.use(express.static(__dirname));

// Database Logic
const dbPath = path.join(__dirname, 'database.json');

function getInventory() {
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (e) {
            console.error("Error reading DB:", e);
            return [];
        }
    }
    return [];
}

function saveInventoryToDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Database Endpoints
app.get('/api/inventory', (req, res) => {
    res.json(getInventory());
});

app.post('/api/inventory', (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: "Invalid data format" });
        }
        saveInventoryToDB(req.body);
        res.json({ success: true });
    } catch (e) {
        console.error("Error saving DB:", e);
        res.status(500).json({ error: 'Failed to save inventory.' });
    }
});

// Media Upload Endpoint
app.post('/api/upload', upload.array('media', 10), (req, res) => {
    try {
        const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ urls: fileUrls });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Failed to upload files." });
    }
});

app.post('/api/enhance', async (req, res) => {
    try {
        const { draft } = req.body;
        
        if (!draft) {
            return res.status(400).json({ error: "Draft text is required." });
        }

        const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 300,
            temperature: 0.7,
            system: "You are an expert automotive copywriter. The user will provide rough notes about a Toyota car or part. Write exactly 3-5 premium, persuasive bullet points highlighting its reliability and condition. IMPORTANT: Separate each bullet point with a comma (e.g. Pristine 3.5L V6 Engine, Flawless Leather Interior, Fully Inspected). Do NOT use bullet symbols or newlines.",
            messages: [
                {
                    "role": "user",
                    "content": draft
                }
            ]
        });

        res.json({ result: msg.content[0].text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate AI description." });
    }
});

app.listen(port, () => {
    console.log(`AI Backend running at http://localhost:${port}`);
});
