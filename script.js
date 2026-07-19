let schedule = [];
let quotes = [];

let currentGame = null;

let currentScreen = 0;

const screens = [
    "countdownScreen",
    "scheduleScreen",
    "quoteScreen"
];

async function loadData() {

    const scheduleResponse = await fetch("schedule.json");
    schedule = await scheduleResponse.json();

    const quoteResponse = await fetch("quotes.json");
    const quoteData = await quoteResponse.json();

    quotes = quoteData.quotes;

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

    },1000);
    showScreen(screens[0]);

    setInterval(nextScreen,15000);

}

function showScreen(id){

    screens.forEach(screen=>{

        document
            .getElementById(screen)
            .classList.add("hidden");

    });

    document
        .getElementById(id)
        .classList.remove("hidden");
    if(id==="scheduleScreen")
        buildSchedule();

    if(id==="quoteScreen")
        showRandomQuote();
}

function nextScreen(){

    currentScreen++;

    if(currentScreen>=screens.length){

        currentScreen=0;

    }

    showScreen(screens[currentScreen]);

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
