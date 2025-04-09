const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the web-build directory
app.use(express.static(path.join(__dirname, 'web-build')));

// For any other routes, serve index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 