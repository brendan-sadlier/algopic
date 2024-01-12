const express = require('express');
const app = express();

const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const fs = require('fs');
const path = require('path');

const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const multer = require('multer');

app.use(cors());

// Image Uploads
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

app.use(express.static(path.join(__dirname, ('uploads'))));
app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
  });

const upload = multer({ storage: storage });

app.get('/game-data', (req, res) => {

    const filePath = path.join(__dirname, 'game-data.json');
    fs.readFileSync(filePath, 'utf8', (err, data) => {

        if (err) {
            console.log('Error reading game data: ', err);
            res.status(500).send('Error reading game data');
            return;
        }

        res.json(JSON.parse(data));
    });
});

app.post('/upload', upload.array('images'), async (req, res) => {

    try {
        const files = req.files;
        console.log(files);
        const newResults = [];

        for (const file of files) {

            // Process each file using GPT-4 Vision API
            const fileOriginalName = file.originalname;
            console.log('Processing file: ', fileOriginalName);

            const filePath = 'uploads/' + fileOriginalName;
            console.log('File path: ', filePath);
            const labels = await processImageWithGPT4Vision(filePath, 
                "Generate 20 one word objects in this image without any explanations in the form [1. Object One - <Score>]. Give a score for each object from 1 to 10, where 1 is the easiest object to guess and 10 is the hardest to guess.");
            console.log('Labels: ', labels);
            newResults.push({ path: 'uploads/' + fileOriginalName, labels });
        }

        // Read existing game data from file
        let existingResults = [];

        if (fs.existsSync('game-data.json')) {
            existingResults = JSON.parse(fs.readFileSync('game-data.json'));
        }

        // Merge new results with existing results
        const combinedResults = existingResults.concat(newResults);

        try {
            fs.writeFileSync('game-data.json', JSON.stringify(combinedResults, null, 2));
        } catch (error) {
            console.log('Error writing game data: ', error);
        }

        res.send({ message: 'Success image uploaded & processes', results: newResults });
    } catch (error) {
        console.error('Error uploading images: ', error);
        res.status(500).send('Error uploading images');
    }
});

const processImageWithGPT4Vision = async (filePath, prompt) => {

    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const imageAsBase64 = fs.readFileSync(filePath, 'base64');
        const mimeType = getMimeType(filePath);
        console.log(`MIME type for ${filePath}: ${mimeType}`);
    
    
        const imageContext = {
            type: 'image_url',
            image_url:  `data:${mimeType};base64,${imageAsBase64}`
        };
    
        const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
                { role: 'system', content: prompt },
                {
                    role: 'user',
                    content: [
                        imageContext
                    ],
                },
            ],
            max_tokens: 500,
            seed: 123,
        });
    
        // Process labels to split into name and score
        const labels = response.choices[0].message.content
        .split('\n')
        .map(label => {
            // Extract the label name and score
            const parts = label.match(/^(\d+\.\s+)(.*?)(\s+-\s+)(\d+)$/);
            if (parts) {
                const name = parts[2].trim(); // Second group is the label name
                const score = parseFloat(parts[4]); // Fourth group is the score
                return { name, score };
            }
            return null;
        })
        .filter(label => label !== null); // Filter out any null entries

        return labels;

    } catch (error) {
        console.error('Error processing image with Vision API', error);
        return [];
    
    }

};




// Socket.io Configs
const server = http.createServer(app);

let gameLobbies = {};

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
}, { transports: ['websocket'], upgrade: false });

io.on('connection', (socket) => {

    // Client Connected
    console.log('Client connected: ', socket.id);

    // Create Game Listener
    socket.on('create-game', username => {

        if (username) {

            // Generate new game code
            const gameCode = generateNewGameCode();
            console.log(`Game code generated: ${gameCode}`);

            gameLobbies[gameCode] = {
                host: username,
                players: [username],
                currentImageIndex: 0,
                scores: { [username]: 0 }
            };

            // Join socket to game room
            socket.join(gameCode);
            console.log(`Player ${username} created game ${gameCode}`);
            socket.emit('gameCreated', gameCode);
        } else {
            console.log('Invalid username');
        }
    });

    // Join Game Listener
    socket.on('joinGame', ({username, gameCode}) => {

        console.log(`Received joinGame event: username = ${username}, gameCode = ${gameCode}`);

        if (username && gameCode) {
            socket.join(gameCode);
            socket.username = username;
            console.log(`Player ${username} joined game ${gameCode}`);
    
            // Add the player to the game
            if (!gameLobbies[gameCode]) {
                gameLobbies[gameCode] = { host: username, players: [] };
            }

            // Add the new player to the scores object with the initial score of 0
            if (!gameLobbies[gameCode].scores[username]) {
                gameLobbies[gameCode].scores[username] = 0;            
            }

            // Check if the player is already in the game before adding
            if (!gameLobbies[gameCode].players.includes(username)) {
                gameLobbies[gameCode].players.push(username);
            }
    
            io.to(gameCode).emit('updatePlayers', { players: gameLobbies[gameCode].players, host: gameLobbies[gameCode].host });
            console.log(gameLobbies[gameCode]);
        } else {
            console.log('Invalid username or game code', { username, gameCode });
        }
    });

    socket.on('startGame', ({ gameCode }) => {
        console.log(`Starting game ${gameCode}`);
        // Add code to start the game
        startGameTimer(gameCode);
        io.to(gameCode).emit('gameStarting', gameCode);
    });

    socket.on('updateScore', ({ username, gameCode, pointsEarned }) => {
        if (gameLobbies[gameCode] && gameLobbies[gameCode].scores[username] !== undefined) {
            gameLobbies[gameCode].scores[username] += pointsEarned;
            console.log(`Updated score for ${username} in game ${gameCode}: ${gameLobbies[gameCode].scores[username]}`);
        } else {
            console.log(`Score update failed for ${username} in game ${gameCode}`);
        }
    });

    // socket.on('resetGame', ({ gameCode }) => {

    //     // Notify client or handle errors as needed
    //     io.to(gameCode).emit('redirectHome');

    //     // Clear the uploads directory
    //     const uploadsPath = path.join(__dirname, 'public', 'uploads');
    //     console.log(`Attempting to clear uploads directory: ${uploadsPath}`)
    //     deleteFilesInDirectory(uploadsPath);

    //     // Delete the results.json file
    //     const resultsFilePath = path.join(__dirname, 'results.json');
    //     if (fs.existsSync(resultsFilePath)) {
    //         fs.unlinkSync(resultsFilePath);
    //         console.log('results.json deleted.');
    //     } else {
    //         console.log('results.json does not exist.');
    //     }
    // });


    // Disconnect Listener
    socket.on('disconnect', () => {
        for (const gameCode in gameLobbies) {
            const playerIndex = gameLobbies[gameCode].players.indexOf(socket.username);
            if (playerIndex !== -1) {
                gameLobbies[gameCode].players.splice(playerIndex, 1);
                io.to(gameCode).emit('updatePlayers', { players: gameLobbies[gameCode].players, host: gameLobbies[gameCode].host });
                break;
            }
        }

        socket.removeAllListeners();
        console.log("Player disconnected", socket.username);
        console.log('Client disconnected', socket.id);

    });

});

// Helper Functions
const generateNewGameCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const gameCodeLength = 6;
    let gameCode = '';
    for (let i = 0; i < gameCodeLength; i++) {
        gameCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return gameCode;
};

function getMimeType (filePath) {
    const extension = path.extname(filePath).toLowerCase();
    switch (extension) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        // Add more cases for other image types if needed
        default:
            return 'application/octet-stream'; // Default MIME type for unknown files
    }
}

// Start Server
server.listen(3001, () => {
    console.log(`Listening on port 3001`)
});