require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Supabase Initialization
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Anthropic AI Initialization
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure Multer for memory storage (for Supabase uploads)
const upload = multer({ storage: multer.memoryStorage() });

// Serve the frontend web pages natively (bypasses Live Server entirely)
app.use(express.static(__dirname));

// Database Endpoints
app.get('/api/inventory', async (req, res) => {
    try {
        const { data, error } = await supabase.from('inventory').select('*');
        if (error) throw error;
        res.json(data || []);
    } catch (e) {
        console.error("Error fetching DB:", e);
        res.status(500).json({ error: 'Failed to fetch inventory.' });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: "Invalid data format" });
        }
        
        // Frontend sends the entire state array. We sync by deleting removed cars and upserting the rest.
        const newIds = req.body.map(c => c.id).filter(id => id);
        
        if (newIds.length > 0) {
            await supabase.from('inventory').delete().not('id', 'in', `(${newIds.join(',')})`);
        } else {
            await supabase.from('inventory').delete().neq('id', 'dummy_never_match');
        }
        
        if (req.body.length > 0) {
            const { error } = await supabase.from('inventory').upsert(req.body);
            if (error) throw error;
        }

        res.json({ success: true });
    } catch (e) {
        console.error("Error saving DB:", e);
        res.status(500).json({ error: 'Failed to save inventory.' });
    }
});

// Media Upload Endpoint (Direct to Supabase Storage)
app.post('/api/upload', upload.array('media', 10), async (req, res) => {
    try {
        const fileUrls = [];
        for (const file of req.files) {
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
            
            const { data, error } = await supabase.storage.from('media').upload(fileName, file.buffer, {
                contentType: file.mimetype
            });
            
            if (error) throw error;
            
            const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
            fileUrls.push(publicUrlData.publicUrl);
        }
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

module.exports = app;
