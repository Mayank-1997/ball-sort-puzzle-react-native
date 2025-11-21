const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    let filePath = path.join(__dirname, 'web', req.url === '/' ? 'index.html' : req.url);
    
    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    
    // Set content type
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Not Found</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            min-height: 100vh;
                            margin: 0;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        h1 { font-size: 4rem; margin-bottom: 20px; }
                        p { font-size: 1.2rem; }
                        a { color: #FFD700; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <h1>🎮 404</h1>
                    <h2>Page Not Found</h2>
                    <p>The requested file could not be found.</p>
                    <p><a href="/">← Back to Ball Sort Puzzle</a></p>
                </body>
                </html>
            `);
            return;
        }
        
        // Read and serve file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>500 - Server Error</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                text-align: center; 
                                padding: 50px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                min-height: 100vh;
                                margin: 0;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                            }
                            h1 { font-size: 4rem; margin-bottom: 20px; }
                            p { font-size: 1.2rem; }
                            a { color: #FFD700; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <h1>⚠️ 500</h1>
                        <h2>Server Error</h2>
                        <p>Internal server error occurred.</p>
                        <p><a href="/">← Back to Ball Sort Puzzle</a></p>
                    </body>
                    </html>
                `);
                return;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        });
    });
});

server.listen(port, () => {
    console.log('🎮 Ball Sort Puzzle Web Server Started!');
    console.log('=====================================');
    console.log(`🌐 Server running at: http://localhost:${port}`);
    console.log(`📱 Game accessible at: http://localhost:${port}/`);
    console.log('🎯 Features available:');
    console.log('   • Interactive Ball Sort Puzzle gameplay');
    console.log('   • Progressive difficulty levels');
    console.log('   • Move counter and timer');
    console.log('   • Undo functionality');
    console.log('   • Hint system');
    console.log('   • Responsive design for mobile and desktop');
    console.log('=====================================');
    console.log('Press Ctrl+C to stop the server');
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Ball Sort Puzzle web server...');
    server.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Ball Sort Puzzle web server...');
    server.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
    });
});