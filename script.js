let schedule = [];

async function loadSchedule() {

    const response = await fetch("schedule.json?v=" + Date.new());

    schedule = await response.json();

    startCountdown();
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

function startCountdown() {

    const game = getNextGame();

    if (!game) {

        document.getElementById("countdown").innerHTML = "SEASON COMPLETE";

        return;
    }

    updateCountdown(game);

    setInterval(() => {

        updateCountdown(game);

    }, 1000);

}

loadSchedule();
