import express from 'express'
import cookieParser from 'cookie-parser';
import { 
    getRecord, getGames, getTeams, addGame, findUserCreds, findUser, addRefreshToken,
    getRefreshToken, deleteRefreshToken, getAdminRoster, getFullRoster
} from './database.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { error, log } from 'console';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs';
import { ref } from 'process';
dotenv.config();

//////////////////////////////////////////////////////////////////////////////////////////////////
// Middleware and Set-up
/////////////////////////////////////////////////////////////////////////////////////////////////

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
 * Middleware: Serve static files (HTML, CSS, JS, images) 
 * from the public folder so the client can load them.
 */
app.use(express.static(path.join(__dirname, '..', 'public')));
/**
 * Middleware: Parse raw json files from POST make them available
 * as req.body
 */
app.use(express.json());
app.use(cookieParser())

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Authentication and Authorization
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Event: GET
 * Action: Redirect the user to the login page.
 */
app.get('/', (req, res) => {
    res.redirect('/login');
})

/**
 * Event: GET
 * Action: Load the login page to the user ../public/login.html
 */
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' ,'login.html'));
});

/**
 * Action: POST
 * Event: Receive users password and confirm authorization
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { loginID, password } = req.body;

        if (!loginID || !password) {
            return res.status(422).json({ message: "Please fill out all forms" })
        }

        // Return user row or null
        const user = await findUserCreds(loginID);
        if (!user) {
            return res.status(401).json({ message: "UserName and/or Password is Invalid" });
        }
        const passMatch = await bcrypt.compare(password, user.Password);
        if (!passMatch) {
            return res.status(401).json({ message: "UserName and/or Password is Invalid" });
        }

        // JWT access token
        const payload = {
            userID: user.UserID,
            teamID: user.TeamID,
            userRole: user.UserRole
        };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { subject: 'accessDash', expiresIn: process.env.ACCESS_TKN_EXP } );
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH, { subject: 'refreshDash', expiresIn: process.env.REFRESH_TKN_EXP });

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in ms
        const refreshData = {
            refreshToken,
            userID: user.UserID,
            expiresAt,
            CreatedOn: new Date()
        };
        const db_success = await addRefreshToken(refreshData);
        console.log(db_success);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            userID: user.UserID,
            teamID: user.TeamID,
            userRole: user.UserRole,
            accessToken: accessToken,
        });

        
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Something went wrong in login." });
    }
});

/**
 * Event: POST
 * Action: Post refresh token for user 
 */
app.post('/api/auth/refresh-token', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh Token not found' });
        }

        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH);
        const userRefreshToken = await getRefreshToken( {refreshToken, userID: decodedRefreshToken.userID} );

        if (!userRefreshToken) {
            return res.status(401).json({ message: 'Refresh Token Invalid or Expired' });
        }

        await deleteRefreshToken(refreshToken);

        // Create a new refresh and access token
        // JWT access token
        const payload = {
            userID: decodedRefreshToken.userID,
            teamID: decodedRefreshToken.teamID,
            userRole: decodedRefreshToken.userRole
        };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { subject: 'accessDash', expiresIn: process.env.ACCESS_TKN_EXP } );
        const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH, { subject: 'refreshDash', expiresIn: process.env.REFRESH_TKN_EXP });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const newRefreshData = {
            refreshToken: newRefreshToken,
            userID: decodedRefreshToken.userID,
            expiresAt,
            CreatedOn: new Date()
        };
        const db_success = await addRefreshToken(newRefreshData);
        console.log(db_success);

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict", // Only use cookie when requests are from this site
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            accessToken: accessToken,
        });


    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Refresh Token Invalid or Expired' });
        }
        console.error("Login error:", error);
        return res.status(500).json({ error: "Something went wrong in login." });
    }
})

async function ensureAuthenticated(req, res, next) {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
        return res.status(401).json( {message: "Access Token not found."} );
    }
    try {
        const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = { 
            userID: decodedAccessToken.userID,
            teamID: decodedAccessToken.teamID,
            userRole: decodedAccessToken.userRole
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Access Token expired/not found"});
    }
}
/**
 * Event: GET
 * Action:
 *      Verify that the current user is authenticated when acessing pages
 */
app.get('/api/auth/me', ensureAuthenticated, async (req, res) => {
    try {
        const userID = req.user.userID;
        const user = await findUser(userID);
        if (!user) {
            res.status(404).json( {message: "User not found."} );
        }
        
        return res.status(200).json({
            userID: user.userID,
            teamID: user.teamID,
            userRole: user.userRole,
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
});

/**
 * Event: GET
 * 
 */

//////////////////////////////////////////////////////////////////////////////////////////////////
// Serve Pages
/////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Event: GET
 * Action: Load the home page to the user ../public/pages/home.html
 */
app.get('/home', async (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' , 'pages', 'home.html'));
});

/**
 * Event: GET
 * Action: Load the roster page to the user ../public/pages/roster.html
 */
app.get('/roster', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' , 'pages', 'roster.html'));
});

/**
 * Event: GET
 * Action: Load the games page to the user ../public/pages/games.html
 */
app.get('/games', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' , 'pages', 'games.html'));
});

/**
 * Event: GET
 * Action: Load the stats page to the user ../public/pages/stats.html
 */
app.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' , 'pages', 'stats.html'));
});

/**
 * Event: GET
 * Action: Load the schedule page to the user ../public/pages/schedule.html
 */
app.get('/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' , 'pages', 'schedule.html'));
});

/**
 * Event: GET
 * Action: Load the users page to the user ../public/users/schedule.html
 */
app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public' , 'pages', 'users.html'));
});



////////////////////////////////////////////////////////////////////////////////////////
// HOME QUERIES
////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////
// GAME QUERIES
////////////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////////////
// ROSTER QUERIES
////////////////////////////////////////////////////////////////////////////////////////

/**
 * Event: GET
 * Action: Serve the players roster with admin player data
 */
app.get('/api/players/:id/admin', async (req, res) =>{
    const TeamID = Number(req.params.id);
    try {
        const players = await getAdminRoster(TeamID);
        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json( {error: "Something went wrong getting the players" } );
    }
})

/**
 * Event: GET
 * Action: Serve the players full team roster
 */
app.get('/api/players/:id/roster', async (req, res) =>{
    const TeamID = Number(req.params.id);
    try {
        const players = await getFullRoster(TeamID);
        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json( {error: "Something went wrong getting the players" } );
    }
})

/**
 * Event: LISTEN
 * Action: Monitor current network port for requests
 */
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
