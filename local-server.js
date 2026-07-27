const app = require('./api/index.js');
const express = require('express');
const port = process.env.PORT || 3000;

// Serve static files from the root directory for local testing
app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
});
