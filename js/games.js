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
            row.getElement().style.backgroudnColor = "rgba(0, 255, 0, 0.2)" // light green
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