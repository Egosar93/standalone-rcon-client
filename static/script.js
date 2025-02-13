document.addEventListener("DOMContentLoaded", () => {
  loadServerList();
  populateGameModeAndMapDropdowns();
  populateCommandDropdown();

  document.getElementById("gameMode").addEventListener("change", updateCommand);
  document.getElementById("map").addEventListener("change", updateCommand);
  document.getElementById("commandList").addEventListener("change", selectCommand);
});

async function loadServerList() {
  const serverDropdown = document.getElementById("serverList");

  // Zurücksetzen der Dropdown-Inhalte
  serverDropdown.innerHTML = '<option value="">-- Wähle einen Server --</option>';

  try {
    const response = await fetch('/servers');
    if (!response.ok) throw new Error('Fehler beim Abrufen der Serverliste.');

    const servers = await response.json();

    if (servers.length === 0) {
      const noServerOption = document.createElement("option");
      noServerOption.value = "";
      noServerOption.textContent = "-- Keine Server verfügbar --";
      serverDropdown.appendChild(noServerOption);
      return;
    }

    servers.forEach(server => {
      const option = document.createElement("option");
      option.value = JSON.stringify(server); // JSON-String für einfache Verarbeitung speichern
      option.textContent = `${server.server}:${server.port}`;
      serverDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Fehler beim Laden der Serverliste:", error);
    alert("Fehler beim Laden der Serverliste.");
  }
}





  

function resetAdminFields() {
  if (document.getElementById("server")) {
    document.getElementById("server").value = "";
    document.getElementById("port").value = "";
    document.getElementById("password").value = "";
  }
}

async function saveServer() {
  const server = document.getElementById("server").value.trim();
  const port = document.getElementById("port").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!server || !port || !password) {
    alert("Bitte alle Felder ausfüllen.");
    return;
  }

  try {
    const response = await fetch('/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server, port, password })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Fehler beim Speichern des Servers.');
    }

    alert(result.message);
    loadServerList(); // Aktualisiere die Liste der Server
  } catch (error) {
    document.getElementById("response").innerText = `Fehler: ${error.message}`;
  }
}




async function deleteServer() {
  const serverDropdown = document.getElementById("serverList");
  
  // Prüfen, ob ein Server ausgewählt wurde
  if (!serverDropdown.value) {
    alert("Bitte wähle einen Server zum Löschen aus.");
    return;
  }

  try {
    const selectedServer = JSON.parse(serverDropdown.value); // Server-Daten aus JSON parsen

    // Sende DELETE-Anfrage an das Backend
    const response = await fetch(`/servers/${selectedServer.id}`, { method: 'DELETE' });

    // Prüfen, ob die Antwort JSON ist
    if (response.ok && response.headers.get("Content-Type")?.includes("application/json")) {
      const result = await response.json();

      if (result.error) {
        alert(`Fehler: ${result.error}`);
        return;
      }

      alert(result.message || "Server erfolgreich gelöscht.");
      loadServerList(); // Aktualisiere die Serverliste
    } else {
      const errorText = await response.text(); // Fange nicht-JSON-Antworten ab
      throw new Error(`Ungültige Antwort vom Server: ${errorText}`);
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Servers:", error);
    alert(`Fehler: ${error.message}`);
  }
}




function populateGameModeAndMapDropdowns() {
  const gameModeDropdown = document.getElementById("gameMode");
  const mapDropdown = document.getElementById("map");

  gameModeDropdown.innerHTML = '<option value="">-- Wähle einen Spielmodus --</option>';
  mapDropdown.innerHTML = '<option value="">-- Wähle eine Karte --</option>';

  const gameModes = [
    { value: "game_mode 0; game_type 0", text: "Casual" },
    { value: "game_mode 1; game_type 0", text: "Competitive(5vs5)" },
    { value: "game_mode 2; game_type 0", text: "Wingman(1vs1,2vs2)" },
    { value: "game_mode 0; game_type 1", text: "Arms Race" },
    { value: "game_mode 1; game_type 1", text: "Demolition" },
    { value: "game_mode 2; game_type 1", text: "Deathmatch" },
    { value: "game_mode 0; game_type 2", text: "Training" },
    { value: "game_mode 0; game_type 3", text: "Custom" },
    { value: "game_mode 0; game_type 4", text: "Cooperative" },
    { value: "game_mode 0; game_type 5", text: "Skirmish" }
  ];

  const maps = [
    "de_dust2",
    "de_inferno",
    "de_nuke",
    "de_mirage",
    "de_overpass",
    "de_vertigo"
  ];

  gameModes.forEach(mode => {
    const option = document.createElement("option");
    option.value = mode.value;
    option.textContent = mode.text;
    gameModeDropdown.appendChild(option);
  });

  maps.forEach(map => {
    const option = document.createElement("option");
    option.value = map;
    option.textContent = map;
    mapDropdown.appendChild(option);
  });
}

function populateCommandDropdown() {
  const commandDropdown = document.getElementById("commandList");
  commandDropdown.innerHTML = '<option value="">-- Wähle einen Befehl --</option>';

  const commands = [
    "status",
    "changelevel de_dust2",
    "kick all",
    "mp_restartgame 1",
    "mp_limitteams 1",
    "mp_autoteambalance 0",
    "bot_add",
    "bot_kick",
    "mp_roundtime 60",
    "sv_cheats 1",
    "sv_gravity 200"
  ];


  
  commands.forEach(command => {
    const option = document.createElement("option");
    option.value = command;
    option.textContent = command;
    commandDropdown.appendChild(option);
  });
}

function updateCommand() {
  const gameMode = document.getElementById("gameMode").value;
  const map = document.getElementById("map").value;
  const commandInput = document.getElementById("command");

  if (gameMode && map) {
    commandInput.value = `${gameMode}; changelevel ${map}`;
  } else if (gameMode) {
    commandInput.value = gameMode;
  } else if (map) {
    commandInput.value = `changelevel ${map}`;
  } else {
    commandInput.value = "";
  }
}

function selectCommand() {
  const commandDropdown = document.getElementById("commandList");
  const selectedCommand = commandDropdown.value;
  const commandInput = document.getElementById("command");

  if (selectedCommand) {
    commandInput.value = selectedCommand;
  }
}

async function sendCommand(event) {
  event.preventDefault();

  const serverDropdown = document.getElementById("serverList");
  const selectedOption = serverDropdown.options[serverDropdown.selectedIndex];

  if (!selectedOption || selectedOption.value === "") {
    alert("Bitte einen Server auswählen.");
    return;
  }

  const selectedServer = JSON.parse(selectedOption.value);
  const command = document.getElementById("command").value.trim();

  if (!command) {
    alert("Bitte einen Befehl eingeben.");
    return;
  }

  try {
    const response = await fetch("/send-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        server: selectedServer.server,
        port: selectedServer.port,
        password: selectedServer.password,
        command: command
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error);
    }

    document.getElementById("response").innerText = result.response || "Befehl erfolgreich gesendet!";
  } catch {
    document.getElementById("response").innerText = "Fehler beim Senden des Befehls.";
  }
}

function selectServer() {
  const serverDropdown = document.getElementById("serverList");
  const selectedOption = serverDropdown.options[serverDropdown.selectedIndex];

  if (!selectedOption || selectedOption.value === "") {
    resetFields(); // Felder leeren, wenn kein Server ausgewählt ist
    return;
  }

  try {
    const selectedServer = JSON.parse(selectedOption.value); // Serverdaten parsen

    // Admin-only Felder füllen (falls sichtbar)
    if (document.getElementById("server")) {
      document.getElementById("server").value = selectedServer.server || "";
      document.getElementById("port").value = selectedServer.port || "";
      document.getElementById("password").value = selectedServer.password || ""; // Direkt das Passwort setzen
    }

    // Befehlseingabe leeren
    document.getElementById("command").value = "";
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Serverdaten:", error);
    alert("Fehler beim Laden der Serverdaten.");
    resetFields();
  }
}


async function startKnifeRound() {
  const server = document.getElementById("server").value;
  const port = document.getElementById("port").value;
  const password = document.getElementById("password").value;

  if (!server || !port || !password) {
      alert("Bitte Server, Port und Passwort eingeben.");
      return;
  }

  try {
      const response = await fetch("/start-knife-round", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ server, port, password })
      });

      const result = await response.json();
      document.getElementById("response").innerText = result.response;
  } catch (error) {
      document.getElementById("response").innerText = `Fehler: ${error.message}`;
  }
}


// Felder leeren, wenn keine Auswahl getroffen wurde
function resetFields() {
  if (document.getElementById("server")) {
    document.getElementById("server").value = "";
    document.getElementById("port").value = "";
    document.getElementById("password").value = "";
  }
  document.getElementById("command").value = "";
}

