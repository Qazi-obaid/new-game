const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read scores
const readScores = () => {
    try {
        if (!fs.existsSync(SCORES_FILE)) {
            return [];
        }
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading scores:", error);
        return [];
    }
};

// Helper function to write scores
const writeScores = (scores) => {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing scores:", error);
    }
};

// Get top 10 scores
app.get('/api/scores', (req, res) => {
    const scores = readScores();
    // Sort primarily by time (lowest first), then by moves (lowest first)
    scores.sort((a, b) => {
        if (a.time === b.time) {
            return a.moves - b.moves;
        }
        return a.time - b.time;
    });
    res.json(scores.slice(0, 10));
});

// Submit a new score
app.post('/api/scores', (req, res) => {
    const { name, time, moves } = req.body;
    
    if (!name || time === undefined || moves === undefined) {
        return res.status(400).json({ error: "Missing required fields: name, time, moves" });
    }

    const newScore = {
        id: Date.now().toString(),
        name,
        time: Number(time),
        moves: Number(moves),
        date: new Date().toISOString()
    };

    const scores = readScores();
    scores.push(newScore);
    writeScores(scores);

    res.status(201).json(newScore);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
