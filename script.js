//get dom elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeList = document.getElementById("attendeeList");

const maxCount = 50;
const storageKey = "checkInData";

let count = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];

function getTeamLabel(team) {
  if (team === "water") {
    return "Team Water Wise";
  }
  if (team === "zero") {
    return "Team Net Zero";
  }
  if (team === "power") {
    return "Team Renewables";
  }
  return "Team";
}

function loadData() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return;
  }

  try {
    const data = JSON.parse(saved);

    if (data && typeof data.totalCount === "number") {
      count = data.totalCount;
    }

    if (data && data.teamCounts) {
      teamCounts.water = data.teamCounts.water || 0;
      teamCounts.zero = data.teamCounts.zero || 0;
      teamCounts.power = data.teamCounts.power || 0;
    }

    if (data && Array.isArray(data.attendees)) {
      attendees = data.attendees;
    }
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

function saveData() {
  const data = {
    totalCount: count,
    teamCounts: teamCounts,
    attendees: attendees,
  };

  localStorage.setItem(storageKey, JSON.stringify(data));
}

function updateProgressBar() {
  const percentage = Math.min(Math.round((count / maxCount) * 100), 100);
  progressBar.style.width = `${percentage}%`;
}

function updateCounters() {
  attendeeCount.textContent = count;
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;
  updateProgressBar();
}

function updateAttendeeList() {
  attendeeList.innerHTML = "";

  if (attendees.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "attendee-empty";
    emptyItem.textContent = "No attendees yet.";
    attendeeList.appendChild(emptyItem);
    return;
  }

  attendees.forEach(function (attendee) {
    const item = document.createElement("li");
    item.className = "attendee-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = attendee.name;

    const teamSpan = document.createElement("span");
    teamSpan.className = "attendee-team";
    teamSpan.textContent = attendee.teamName;

    item.appendChild(nameSpan);
    item.appendChild(teamSpan);
    attendeeList.appendChild(item);
  });
}

function getWinningTeams() {
  const maxTeamCount = Math.max(
    teamCounts.water,
    teamCounts.zero,
    teamCounts.power,
  );
  const winners = [];

  if (teamCounts.water === maxTeamCount) {
    winners.push(getTeamLabel("water"));
  }
  if (teamCounts.zero === maxTeamCount) {
    winners.push(getTeamLabel("zero"));
  }
  if (teamCounts.power === maxTeamCount) {
    winners.push(getTeamLabel("power"));
  }

  if (winners.length === 1) {
    return winners[0];
  }

  return `Tie between ${winners.join(" and ")}`;
}

function checkCelebration() {
  if (count < maxCount) {
    celebrationMessage.style.display = "none";
    return;
  }

  const winningTeams = getWinningTeams();
  celebrationMessage.textContent = `Celebration time! ${winningTeams} takes the spotlight!`;
  celebrationMessage.style.display = "block";
}

function showGreetingMessage(name, teamName) {
  greeting.textContent = `🎊 Welcome, ${name} from ${teamName}!`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";
}

function initialize() {
  loadData();
  updateCounters();
  updateAttendeeList();
  checkCelebration();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;

  if (!name || !team) {
    return;
  }

  count++;
  teamCounts[team] = teamCounts[team] + 1;
  attendees.push({
    name: name,
    team: team,
    teamName: teamName,
  });

  updateCounters();
  updateAttendeeList();
  showGreetingMessage(name, teamName);
  checkCelebration();
  saveData();

  //reset form
  form.reset();
});

initialize();
