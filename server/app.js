import express from 'express'
import { getRecord, getGames, getTeams, addGame } from './database.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { error } from 'console';

const app = express();
const PORT = 3000;

// Needed to get __dirname in ES modules
/**
 * Action: Take the file url that is passed file:///home/...
 * and convert it to a file path
 */
const __filename = fileURLToPath(import.meta.url);
/**
 * Action: Take the file name /home/...
 * and extract the directory name of the current module 
 * app.js
 */
const __dirname = path.dirname(__filename);

/**
 * Event: GET
 * Action: Load the login page to the user ../public/login.html
 */
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' ,'login.html'));
});


/**
 * Middleware: Serve static files (HTML, CSS, JS, images) 
 * from the public folder so the client can load them.
 */
app.use(express.static(path.join(__dirname, '..', 'public')));
/**
 * Middleware: Parse raw json files from POST make them available
 * as req.body
 */
app.use(express.json());

/**
 * Event: GET the teams current record
 * Action: Serve the the team from teamID's current 
 * record from the database
 */
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

/**
 * Event: GET teams games
 * Action: Serve the team from team ids 
 * past and future games
 */
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

/**
 * Event: GET teams
 * Action: Serve the add teams form with a list of
 * the current teams with their team id in the database
 */
app.get('/api/teams', async (req, res) => {
    // const TeamID = Number(req.params.id); we will use this later to not get ourselves

    try {
        const names = await getTeams();
        res.json(names); // Respond with json file of teams
    } catch (err) {
        console.error(err);
        res.status(500).json( { error: "Something went wrong loading teams" })
    }
})

/**
 * Event: POST a new game 
 * Action: Send a new game to the Coaches Dashboard 
 * serve it to the table on games.html
 */
app.post('/api/team/:id/addgame', async (req, res) => {
    const TeamID = Number(req.params.id);
    try {
        const gameID = await addGame(req.body, TeamID);
        res.json( {success: true, gameID} );
    } catch (err) {
        console.error(err);
        res.status(500).json( {error: "Something went wrong adding a game"} );
    }
})

/**
 * Event: LISTEN
 * Action: Monitor current network port for requests
 */
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
