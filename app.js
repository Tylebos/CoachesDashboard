import express from 'express'
import { getRecord, getGames } from './database.js'
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Needed to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve your static files (HTML, CSS, JS, images) from their local directory
app.use(express.static(path.join(__dirname)));

app.get('/api/teams/:id/record', async (req, res) => {
    const TeamID = Number(req.params.id) // Pull variable from api right of the :
    try {
        const record = await getRecord(TeamID) // Wait for response
        res.json(record[0])
    } catch (err) {
        console.error(err)
        res.status(500).json( { error: "Something went wrong." })
    }
})

app.get('/api/teams/:id/games', async (req, res) => {
    const TeamID = Number(req.params.id)
    try {
        const games = await getGames(TeamID)
        res.json(games)
    } catch (err) {
        console.error(err)
        res.status(500).json( { error: "Something went wrong."} )
    }
})

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
