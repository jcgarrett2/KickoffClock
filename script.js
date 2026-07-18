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
        "- " + quotes[random].author;

}
function buildSchedule(){

    let html = "";

    schedule.forEach(game=>{

        const date = new Date(game.date);

        html += `
            <div>
                ${date.toLocaleDateString("en-US",
                {
                    month:"short",
                    day:"numeric"
                })}
                 -
                ${game.away} @ ${game.home}
            </div>
        `;

    });

    document.getElementById("scheduleList").innerHTML = html;

}

loadData();
