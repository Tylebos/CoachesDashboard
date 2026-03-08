import { checkAuth } from "./auth.js";

/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * Date Started: 19 Jan 2026
 * Date Modified: 8 March 2026
 * File: home.js
 * Description:
 *      Front end JS for the home page. Manages Chart.JS, Tabulator, and API fetches
 *      ONLY after authentication succeeds.
 * github: Tylebos
 */

////////////////////////////////////////////////////////////////////////////////////////////
// CHARTS
////////////////////////////////////////////////////////////////////////////////////////////
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
};

let statChart;

function initCharts() {
    const ctx = document.getElementById('stat-chart').getContext('2d');
    statChart = new Chart(ctx, {
        type: chartData.ppg.type,
        data: {
            labels: chartData.ppg.labels,
            datasets: [{
                label: chartData.ppg.title,
                data: chartData.ppg.data,
                borderColor: 'gray',
                backgroundColor: 'rgba(65,105,225,0.4)',
                borderWidth: 1,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: chartData.ppg.title, font: { size: 18, weight: 'bold' } },
                legend: { display: false }
            },
            scales: { y: { min: 0 } }
        }
    });
}

function changeChart(statKey) {
    const stat = chartData[statKey];
    statChart.config.type = stat.type;
    statChart.data.labels = stat.labels;
    statChart.data.datasets[0].data = stat.data;
    statChart.data.datasets[0].label = stat.title;

    if (stat.getColors) {
        const colors = stat.getColors(stat.data);
        statChart.data.datasets[0].backgroundColor = colors;
        statChart.data.datasets[0].borderColor = colors;
    } else {
        statChart.data.datasets[0].backgroundColor = 'rgba(65,105,225,0.4)';
        statChart.data.datasets[0].borderColor = 'gray';
    }

    statChart.options.plugins.title.text = stat.title;

    if (stat.type === 'bar') {
        statChart.options.scales.x.offset = true;
        statChart.options.scales.x.categoryPercentage = 0.8;
        statChart.options.scales.x.barPercentage = 0.9;
    } else {
        statChart.options.scales.x.offset = false;
        statChart.options.scales.x.categoryPercentage = 1;
        statChart.options.scales.x.barPercentage = 1;
    }

    statChart.options.scales.y.min = stat.title === 'Turnover Ratio' ? undefined : 0;
    statChart.update();
}
window.changeChart = changeChart;

////////////////////////////////////////////////////////////////////////////////////////////
// STANDINGS
////////////////////////////////////////////////////////////////////////////////////////////
const divisionData = [
    {Standing: 1, TeamCity: "Mainland", TeamName: "Bucanneers", W: 4, L: 0},
    {Standing: 2, TeamCity: "Deland", TeamName: "Bulldogs", W: 3, L: 1},
    {Standing: 3, TeamCity: "Deltona", TeamName: "Wolves", W: 3, L: 1},
    {Standing: 4, TeamCity: "Pine Ridge", TeamName: "Panthers", W: 1, L: 3}
];

const leagueData = [
    {Standing: 1, TeamCity: "Riverton", TeamName: "Hawks", W: 4, L: 0},
    {Standing: 2, TeamCity: "Southside", TeamName: "SeaDragons", W: 4, L: 0},
    {Standing: 3, TeamCity: "Western", TeamName: "Cowboys", W: 4, L: 0},
    {Standing: 4, TeamCity: "Mainland", TeamName: "Bucanneers", W: 4, L: 0},
    {Standing: 5, TeamCity: "Deland", TeamName: "Bulldogs", W: 3, L: 1},
    {Standing: 6, TeamCity: "Deltona", TeamName: "Wolves", W: 3, L: 1},
    {Standing: 7, TeamCity: "Pine Ridge", TeamName: "Panthers", W: 1, L: 3}
];

let standingsTable;

function initStandings() {
    standingsTable = new Tabulator("#standings-table", {
        data: divisionData,
        maxHeight: 300,
        layout: "fitColumns",
        columns: [
            { title: "Standing", field: "Standing", width: 90, hozAlign: "center", resizable: false },
            { title: "Team", field: "TeamCity", formatter: cell => `${cell.getData().TeamCity} ${cell.getData().TeamName}`, resizable: false },
            { title: "W", field: "W", width: 70, hozAlign: "center", resizable: false },
            { title: "L", field: "L", width: 70, hozAlign: "center", resizable: false }
        ],
        headerSort: false,
        rowFormatter: row => {
            if(row.getData().TeamName === "Wolves") {
                row.getElement().style.backgroundColor = "#e6f2ff";
            }
        }
    });
}

function changeStand(type) {
    if(type === "div") {
        standingsTable.replaceData(divisionData);
        document.querySelector(".standings-title").textContent = "Division Standings";
    } else {
        standingsTable.replaceData(leagueData);
        document.querySelector(".standings-title").textContent = "League Standings";
    }
}
window.changeStand = changeStand;

////////////////////////////////////////////////////////////////////////////////////////////
// TEAM RECORD
////////////////////////////////////////////////////////////////////////////////////////////
async function loadTeamRecord(teamID) {
    if(!teamID) return; // prevent NaN error
    try {
        const res = await fetch(`/api/teams/${teamID}/record`);
        if(!res.ok) throw new Error(`HTTP Error! status code: ${res.status}`);
        const record = await res.json();
        document.querySelector('.win-loss').textContent = `${record.Wins} - ${record.Losses}`;
    } catch(err) {
        console.error("Failed to load team record: ", err);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// INIT PAGE
////////////////////////////////////////////////////////////////////////////////////////////
async function initPage() {
    await checkAuth(); // blocks if token missing

    const pageContainer = document.getElementById('page-container');
    

    const teamID = localStorage.getItem("teamID");
    if(!teamID) {
        console.warn("No teamID found. Redirecting to login.");
        window.location.href = '/';
        return;
    }
    pageContainer.style.display = 'block'; // only after auth passes

    initCharts();
    initStandings();
    await loadTeamRecord(teamID);
}

// run only after DOM is ready
document.addEventListener('DOMContentLoaded', initPage);