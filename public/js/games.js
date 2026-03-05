/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * Date Started: 19 Jan 2026
 * Date Modified: 3 March 2026
 * File: games.js
 * Description:
 *      Front-End JavaScript for the games page. Manage table and 
 *      GUI for importing table data
 * github: Tylebos
 */

////////////////////////////////////////////////////////////////////////////////////////////
// Table
////////////////////////////////////////////////////////////////////////////////////////////
let gamesTable = new Tabulator("#games-table", {
    layout: "fitColumns",
    columns: [
        { title: "Opponent", field: "OpponentName", width: 275, resizable: false},
        { title: "Location", field: "Location", width: 275, resizable: false },
        { title: "Date", field: "GameDate", width: 250, resizable: false },
        { title: "Time", field: "GameTime", width: 250, resizable: false },
        { title: "Result", field: "Result", width: 200, resizable: false },
        {title: "GameType", field: "GameType", width: 200, resizable: false }
    ],
    headerSort: false, // Disable sort on header
    rowFormatter: function(row){
        // Highlight wins as green and losses as red
        let data = row.getData()
        if (data.Result === 'W') {
            row.getElement().style.backgroundColor = "rgba(0, 255, 0, 0.2)" // light green
        } else if (data.Result === 'L') {
            row.getElement().style.backgroundColor = "rgba(255, 0, 0, 0.2)" // light red
        }
    }
});

async function loadGames(teamID) {
    try {
        const res = await fetch(`/api/teams/${teamID}/games`);
        if (!res.ok) {
            throw new Error(`HTTP Error! status code: ${res.status}`);
        }
        const games = await res.json();
        games.forEach(game => {
            let jsDate = new Date(game.GameDate);
            game.GameDate = jsDate.toISOString().split("T")[0]; // Keep only "YYYY-MM-DD"
        });
        // Populate the table
        gamesTable.setData(games);
    } catch (err) {
        console.error("Failed to load team games", error);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Form
////////////////////////////////////////////////////////////////////////////////////////////

const modal = document.getElementById("game-modal");
const openBTN = document.getElementById("open-modal-btn");
const closeBTN = document.querySelector(".close-btn");
const form = document.getElementById("game-form");
const reset = document.getElementById("reset-btn");
const submitBTN = document.getElementById('submit-btn');

// Open the form
openBTN.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Close the form
closeBTN.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
});

// Close the form if the user clicks outside the box
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        form.reset();
    }
});

// Reset the form input values
reset.addEventListener('click', () => {
    form.reset();
})

// load the teams opponent names selector
async function loadTeams() {
    try {
        const res = await fetch('/api/teams');

        if (!res.ok) {
            throw new Error(`HTTP Error! ${res.status}`);
        }

        const teams =  await res.json();
        const select = document.getElementById("opponent-select");
        teams.forEach(team => {
            const option = document.createElement("option");

            option.value = team.TeamID;
            option.textContent = team.Name; // Already concatanated city + name
            
            select.appendChild(option);
        })
    } catch (err) {
        console.error("Failed to load teams", err);

    }
}

// submit data in the form to database
submitBTN.addEventListener('click', async () => {
    // Gather data from the form to POST
    const gameData = {
        opponentID: form.OpponentID.value,
        location: form.Location.value,
        gameDate: form.GameDate.value,
        gameTime: form.GameTime.value,
        opponentScore: form.OpponentScore.value || null,
        teamScore: form.TeamScore.value || null,
        gameType: form.GameType.value
    };

    console.log("Game data loaded", gameData);
    
    // API calls
    try {
        const res = await fetch(`/api/team/${teamID}/addgame`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(gameData)
                    });
        if (!res.ok) {
            throw new Error(`HTTP Error! ${res.status}`);
        }
        await loadGames(teamID);
    } catch (err) {
        console.error("Failed to add game", err);
    }

    form.reset();
    modal.style.display = 'none';
})
