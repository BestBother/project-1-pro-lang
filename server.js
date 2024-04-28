const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const cors = require('cors');


app.use(cors());


app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],  
    credentials: true
}));


app.use(express.static(path.join(__dirname, 'client/build')));

// Define the API endpoint to get current data from a remote service
app.get('/api/current', async (req, res) => {
    const url = 'https://smstestbed.nist.gov/vds/current';
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Define the API endpoint to get sample data from a remote service
app.get('/api/sample', async (req, res) => {
    const count = req.query.count || 1000;
    const url = `https://smstestbed.nist.gov/vds/sample?count=${count}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
