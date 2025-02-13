# Standalone RCON Client

Ein einfacher Standalone-RCON-Client mit einer Weboberfläche zur Kommunikation mit RCON-kompatiblen Spieleservern. Die Anwendung nutzt Flask als Backend und bietet eine benutzerfreundliche Weboberfläche für die Verwaltung und das Senden von RCON-Befehlen.

## Features

- Weboberfläche für die einfache RCON-Kommunikation
- Speichern von Serverkonfigurationen (IP-Adresse, Port, RCON-Passwort)
- Unterstützung für mehrere RCON-Befehle
- Beispielbefehle und Spielmodi zur schnellen Eingabe
- Minimalistische, konsoleartige Benutzeroberfläche

## Installation

### Voraussetzungen

- Docker (empfohlen)
- Python 3.12 oder höher (falls du die Anwendung lokal ohne Docker ausführen möchtest)

### Mit Docker ausführen

1. Repository klonen:

   ```bash
   git clone https://git.maxlan.de/mregosar/standalone-rcon-client
   cd standalone-rcon-client
   ```

2. Docker-Container bauen:

   ```bash
   docker build -t rcon-flask-app .
   ```

3. Docker-Container starten:

   ```bash
   docker run -d -p 5000:5000 rcon-flask-app
   ```

4. Rufe die Webanwendung in deinem Browser auf:

   ```
   http://localhost:5000
   ```

### Lokale Installation

1. Repository klonen:

   ```bash
   git clone https://git.maxlan.de/mregosar/standalone-rcon-client
   cd standalone-rcon-client
   ```

2. (Optional) Virtuelle Umgebung erstellen und aktivieren:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Für Windows: venv\Scripts\activate
   ```

3. Abhängigkeiten installieren:

   ```bash
   pip install -r requirements.txt
   ```

4. Flask-Anwendung starten:

   ```bash
   python app.py
   ```

5. Rufe die Webanwendung in deinem Browser auf:

   ```
   http://localhost:5000
   ```

## Verwendung

1. Gib die Serverinformationen (IP-Adresse, Port, RCON-Passwort) ein.
2. Wähle einen RCON-Befehl aus der Dropdown-Liste oder gib einen benutzerdefinierten Befehl ein.
3. Klicke auf **"Send Command"**, um den Befehl an den Server zu senden.
4. Die Antwort des Servers wird im unteren Bereich angezeigt.



