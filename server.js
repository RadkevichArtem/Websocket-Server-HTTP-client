const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const io = new Server(server);

const keywords = {
    'javascript': ['https://doka.guide/js/', 
                   'https://learn.javascript.ru/', 
                   'https://www.code.mu/ru/javascript/book/prime/'],
    'html':       ['https://doka.guide/html/', 
                   'https://metanit.com/web/html5/', 
                   'https://www.code.mu/ru/markup/book/prime/'],
    'python':     ['https://pymanual.github.io/', 
                   'https://docs.python.org/3/tutorial/index.html', 
                   'https://www.geeksforgeeks.org/python3-tutorial/'],    
 };

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (keyword) => {
        console.log('User entered: ' + keyword);
        const urls = keywords[keyword];
        if (urls) {
            io.emit('urls_list', JSON.stringify(urls));
        } else { io.emit('error_no_keyword', keyword); }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('url_selected', (url) => {
        console.log(`user url_selected: ${url}`);
        fetch(url)
            .then((response) => {
                return response.text();
            })
            .then((resp) => {
                console.log('Downloaded HTML content to server');
                io.emit('content_downloaded', { 'id': url, 'data': resp })
            });
    });
});


server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});