let schedule = [];
let quotes = [];
let rushingStats = [];
let config = [];
let currentGame = null;
let currentScreen = 0;
let rotation = [];
let standings = [];
async function loadData() {

    const scheduleResponse = await fetch("schedule.json");
    schedule = await scheduleResponse.json();

    const quoteResponse = await fetch("quotes.json");
    const quoteData = await quoteResponse.json();

    quotes = quoteData.quotes;

    const rushingResponse = await fetch("rushing.json");
    rushingStats = await rushingResponse.json();

    const configResponse = await fetch("config.json");
    const configData = await configResponse.json();

    const standingsResponse = await fetch("standings.json");
    standings = await standingsResponse.json();

    rotation = configData.rotation;

    startApp();
}

function getNextGame() {

    const now = new Date();

    for (const game of schedule) {

        const kickoff = new Date(game.date);

        if (kickoff > now) {
            return game;
        }
    }

    return null;
}

function updateCountdown(game) {

    const kickoff = new Date(game.date);

    const now = new Date();

    const difference = kickoff - now;

    if (difference <= 0) {

        document.getElementById("countdown").innerHTML = "KICKOFF!";

        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML =
        `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    document.getElementById("awayLogo").src = game.awayLogo;
    document.getElementById("homeLogo").src = game.homeLogo;

    document.getElementById("awayTeam").innerText = game.away;
    document.getElementById("homeTeam").innerText = game.home;

    document.getElementById("location").innerText = game.location;

    document.getElementById("gameDate").innerText =
        kickoff.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

}

function startApp() {

    currentGame = getNextGame();

    if (!currentGame) {

        document.getElementById("countdown").innerHTML =
            "SEASON COMPLETE";

        return;
    }

    updateCountdown(currentGame);

    setInterval(() => {

        updateCountdown(currentGame);

    }, 1000);

    showScreen(rotation[0].screen);

    setTimeout(nextScreen, rotation[0].duration * 1000);
}

function showScreen(screenName) {

    const screenIds = {
        "countdown": "countdownScreen",
        "schedule": "scheduleScreen",
        "standings": "standingsScreen",
        "rush stats": "statsScreen",
        "quote": "quoteScreen"
    };

    const id = screenIds[screenName];

    if (!id) {
        console.error("Unknown screen:", screenName);
        return;
    }

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hidden");
    });

    document.getElementById(id).classList.remove("hidden");

    if (screenName === "schedule") {
        buildSchedule();
    }

    if (screenName === "rush stats") {
        buildStats();
    }

    if (screenName === "quote") {
        showRandomQuote();
    }

    if (screenName === "standings") {
    buildStandings();
}
}

function nextScreen() {

    currentScreen++;

    if (currentScreen >= rotation.length) {
        currentScreen = 0;
    }

    showScreen(rotation[currentScreen].screen);

    setTimeout(
        nextScreen,
        rotation[currentScreen].duration * 1000
    );
}

function buildStandings(){
    
    let html = `

        <table class="schedule-table standings-table">

            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Logo</th>
                    <th>Team</th>
                    <th>Record</th>
                    <th>Region Record</th>
                    <th>Next</th>
                </tr>
            </thead>
            <tbody>
    `;
    standings.forEach(team => {

        html += `

            <tr>

                <td>${team["Standing"]}</td>

                <td>${team["Logo"]}</td>

                <td>${team["team"]}</td>

                <td>${team["Record"]}</td>

                <td>${team["Region Record"]}</td>

                <td>${team["Next"]}</td>

            </tr>

        `;

    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById("standingsList").innerHTML = html;

}

function buildStats() {

    let html = `

        <table class="stats-table">

            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>ATT</th>
                    <th>YDS</th>
                    <th>YPC</th>
                    <th>TD</th>
                </tr>
            </thead>

            <tbody>
    `;

    rushingStats.forEach(player => {

        html += `

            <tr>

                <td>${player["Player #"]}</td>

                <td>${player["Player Name"]}</td>

                <td>${player["Rush Attempts"]}</td>

                <td>${player["Rush Yards"]}</td>

                <td>${player["YPC"]}</td>

                <td>${player["Rush TDS"]}</td>

            </tr>

        `;

    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById("statsList").innerHTML = html;

}

function showRandomQuote(){

    const random =
        Math.floor(Math.random()*quotes.length);

    document.getElementById("quoteText").innerText =
        quotes[random].quote;

    document.getElementById("quoteAuthor").innerText =
         quotes[random].author;

}
function buildSchedule() {

    let html = `
        <table class="schedule-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Opponent</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Result</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    schedule.forEach(game => {

        let rowClass = "";
        let statusClass = "";

        switch (game.status.toLowerCase()) {

            case "win":
                rowClass = "game-win";
                statusClass = "status-win";
                break;

            case "loss":
                rowClass = "game-loss";
                statusClass = "status-loss";
                break;

            case "next":
                rowClass = "game-next";
                statusClass = "status-next";
                break;

            default:
                rowClass = "game-scheduled";
                statusClass = "status-scheduled";
        }

        const opponent =
            game.home === "Holy Spirit"
                ? game.away
                : "@ " + game.home;

        const result =
            (game.homeScore != null && game.awayScore != null)
                ? `${game.homeScore}-${game.awayScore}`
                : "--";

        const logo =
            game.home === "Holy Spirit"
                ? game.awayLogo
                : game.homeLogo;

        html += `
            <tr class="${rowClass}">

                <td>
                    <img class="schedule-logo"
                         src="${logo}"
                         alt="${opponent}">
                </td>

                <td>${opponent}</td>

                <td>${game.location}</td>

                <td>${game.type}</td>

                <td>${result}</td>

                <td class="status ${statusClass}">
                    ${game.status}
                </td>

            </tr>
        `;

    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById("scheduleList").innerHTML = html;

}

loadData();
