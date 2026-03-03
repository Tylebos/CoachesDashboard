/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * Date Started: 19 Jan 2026
 * Date Modified: 3 March 2026
 * File: home.js
 * Description:
 *      Front end JS for the home page. Manage Chart.JS, fetch
 *      record and table data.
 * github: Tylebos
 */

////////////////////////////////////////////////////////////////////////////////////////////
// Chart.JS
////////////////////////////////////////////////////////////////////////////////////////////

const ctx = document.getElementById('stat-chart').getContext('2d');

// Static data for each chart
const chartData = {
    ppg: {
        title: 'Points Per Game',
        type: 'line',
        labels: ['Week1', 'Week2', 'Week3', 'Week4'],
        data: [24, 38, 18, 29]
    },
    tov: {
        title: 'Turnover Ratio',
        type: 'bar',
        labels: ['Week1', 'Week2', 'Week3', 'Week4'],
        data: [3, 10, -5, 7],
        getColors: (data) => data.map(v => v < 0 ? 'red' : 'royalblue')
    },
    rdz: {
        title: 'Redzone Efficiency',
        type: 'bar',
        labels: ['Week1', 'Week2', 'Week3', 'Week4'],
        data: [.53, .75, .46, .61],
        getColors: (data) => data.map(v => v < 0.6 ? 'red' : 'royalblue')
    }
}

// Logic for building out chart
let statChart = new Chart(ctx, {
    type: chartData.ppg.type,
    data: {
        labels: chartData.ppg.labels,
        datasets: [{
            label: chartData.ppg.title,
            data: chartData.ppg.data,
            borderColor: 'black',
            backgroundColor: 'rgba(65,105,225,0.4)',
            borderWidth: 1, 
            borderColor: 'gray',
            hoverBorderWidth: 3,
            hoverBorderColor: 'black',
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Points Per Game',
                font: {
                    size: 18,
                    weight: 'bold'
                }
            },
            legend: {
                display: false
            },
        },
        scales: {
            y : {
                min: 0
            }
        }
    }
}) 
/**
 * Function: changeChart
 * Purpose:
 *      Allow the user to dynamically change the charts display
 * @param: A statKey to determine which chart to display
 * @return: None
 */
function changeChart(statKey) {
    const stat = chartData[statKey];

    statChart.config.type = stat.type;
    statChart.data.labels = stat.labels;
    statChart.data.datasets[0].data = stat.data;
    statChart.data.datasets[0].label = stat.title;

    // Update chart title dynamically
    statChart.options.plugins.title.text = stat.title;

    // Dynamically set bar colors
    if (stat.getColors){
        statChart.data.datasets[0].backgroundColor = stat.getColors(stat.data);
        statChart.data.datasets[0].borderColor = stat.getColors(stat.data);
    } else {
        statChart.data.datasets[0].backgroundColor = 'rgba(65,105,225,0.4)';
        statChart.data.datasets[0].borderColor = 'gray';
    }

    // Conditional spacing for bar charts only
    if (stat.type === 'bar') {
        statChart.options.scales.x.offset = true;
        statChart.options.scales.x.categoryPercentage = 0.8;
        statChart.options.scales.x.barPercentage = 0.9;
    } else {
        // Reset for line chart
        statChart.options.scales.x.offset = false;
        statChart.options.scales.x.categoryPercentage = 1;
        statChart.options.scales.x.barPercentage = 1;
    }

    // Conditional for y-min based on chart
    if (stat.title == 'Turnover Ratio'){
        statChart.options.scales.y.min = undefined;
    } else {
        statChart.options.scales.y.min = 0;
    }

    statChart.update();
}

////////////////////////////////////////////////////////////////////////////////////////////
// Tabulator
////////////////////////////////////////////////////////////////////////////////////////////

var divisionData = [
    {Standing: 1, TeamCity: "Mainland", TeamName: "Bucanneers", W: 4, L: 0},
    {Standing: 2, TeamCity: "Deland", TeamName: "Bulldogs", W: 3, L: 1},
    {Standing: 3, TeamCity: "Deltona", TeamName: "Wolves", W: 3, L: 1},
    {Standing: 4, TeamCity: "Pine Ridge", TeamName: "Panthers", W: 1, L: 3}
]

var leagueData = [
    {Standing: 1, TeamCity: "Riverton", TeamName: "Hawks", W: 4, L: 0},
    {Standing: 2, TeamCity: "Southside", TeamName: "SeaDragons", W: 4, L: 0},
    {Standing: 3, TeamCity: "Western", TeamName: "Cowboys", W: 4, L: 0},
    {Standing: 4, TeamCity: "Mainland", TeamName: "Bucanneers", W: 4, L: 0},
    {Standing: 5, TeamCity: "Deland", TeamName: "Bulldogs", W: 3, L: 1},
    {Standing: 6, TeamCity: "Deltona", TeamName: "Wolves", W: 3, L: 1},
    {Standing: 7, TeamCity: "Pine Ridge", TeamName: "Panthers", W: 1, L: 3}
]

let standingsTable = new Tabulator("#standings-table", {
    data: divisionData,
    maxHeight: 300,
    layout: "fitColumns",
    columns: [
        { title: "Standing", field: "Standing", width: 90, hozAlign: "center", resizable: false},
        { title: "Team", field: "TeamCity", formatter: function(cell){
            // Combine City + Name for display
            return `${cell.getData().TeamCity} ${cell.getData().TeamName}`;
        }, resizable: false},
        { title: "W", field: "W", width: 70, hozAlign: "center", resizable: false },
        { title: "L", field: "L", width: 70, hozAlign: "center", resizable: false }
    ],
    headerSort: false, // Disable sort on header
    rowFormatter: function(row){
        // Optional: highlight your team
        let data = row.getData();
        if(data.TeamName === "Wolves") {
            row.getElement().style.backgroundColor = "#e6f2ff";
        }
    }
});
/**
 * Function: changeStand
 * Purpose:
 *      Change the display of the league and division standings for the user
 * @param: type of table
 * @return: None
 */
function changeStand(type) {
    if (type == "div") {
        standingsTable.replaceData(divisionData);
        document.querySelector(".standings-title").textContent = "Division Standings";
    } else if (type == "lge") {
        standingsTable.replaceData(leagueData);
        document.querySelector(".standings-title").textContent = "League Standings";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// RECORD & NEXT OPPONENT
////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Function: loadTeamRecord
 * Purpose:
 *      fetch teams record from coaches database via API
 * @param: teamID
 * @return: none
 */
async function loadTeamRecord(teamID) {
    try {
        const res = await fetch(`/api/teams/${teamID}/record`); // Pause until fetch complete
        if (!res.ok) {
            throw new Error(`HTTP Error! status code: ${res.status}`);
        }
        const record = await res.json(); // wait for the response

        const recordEl = document.querySelector('.win-loss');
        recordEl.textContent = `${record.Wins} - ${record.Losses}`;
    } catch (err) {
        console.error("Failed to load team record: ", err);
    }
}

