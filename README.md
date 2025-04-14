# Standalone RCON Client for CS-2

Ein einfacher, webbasiertes RCON-Tool für CS2-Server. Die Anwendung nutzt Flask als Backend und bietet eine benutzerfreundliche Weboberfläche für die Verwaltung und das Senden von RCON-Befehlen.

## 📌 **Features**
- ✅ **Web-Oberfläche für RCON-Befehle**
- ✅ **Steam-Login zur Authentifizierung**
- ✅ **Sicherheitsmaßnahmen** (nur Zugriff auf Server, auf denen man spielt)
- ✅ **Server-Management** (Admins können Server hinzufügen/löschen)
- ✅ **Knife Round**
- ✅ **Admin-Berechtigungen per SteamID**

---

## 🛠️ **Installation**
### 🔹 **Voraussetzungen**
- **Docker (empfohlen)** oder **Python 3.12**
- **Steam API Key**
- **.env Datei für sichere Konfiguration**

---

## 🚀 **1. Mit Docker ausführen (empfohlen)**  
Falls du Docker nutzt, führe folgende Befehle aus:

```bash
# Repository klonen
git clone https://github.com/Egosar93/standalone-rcon-client.git
cd standalone-rcon-client

# Docker-Container bauen
docker build -t rcon-flask-app .

# Docker-Container starten
docker run -d -p 5000:5000 --env-file .env rcon-flask-app
```

Die Web-Oberfläche ist nun unter **http://localhost:5000** erreichbar.

---

## 🏠 **2. Manuelle Installation ohne Docker**
Falls du das Tool ohne Docker betreiben willst:

```bash
# Repository klonen
git clone https://github.com/Egosar93/standalone-rcon-client.git
cd standalone-rcon-client

# Virtuelle Umgebung erstellen & aktivieren
python3 -m venv venv
source venv/bin/activate  # Für Windows: venv\Scripts\activate

# Abhängigkeiten installieren
pip install -r requirements.txt

# Anwendung starten
python app.py
```

Danach kannst du die Web-Oberfläche unter **http://localhost:5000** aufrufen.

---

## 🔑 **3. Steam API Key & Admins konfigurieren**
Damit Steam-Login funktioniert, musst du einen **Steam API Key** anlegen und Admin-IDs hinterlegen.

### **📄 `.env` Datei erstellen**
Erstelle eine Datei namens **`.env`** im Hauptverzeichnis des Projekts:

```bash
nano .env
```

Füge dort folgende Inhalte ein:

```ini
# Steam API Key für Login
STEAM_API_KEY=dein_steam_api_key

# Geheimschlüssel für Flask-Session
SECRET_KEY=ein_geheimer_schluessel

# Admin-IDs (SteamID64, durch Komma getrennt)
ADMIN_STEAM_IDS=

ADMIN_OVERRIDE=True

PLAYER_OVERRIDE=false

```


**🚨 WICHTIG:**  
- **STEAM_API_KEY** kannst du unter [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) erstellen.
- **SteamID64** kannst du unter [https://steamid.io/](https://steamid.io/) finden.
- **SECRET_KEY** sollte ein zufälliger, langer String sein (z. B. mit `openssl rand -hex 32` generieren).

Danach speichere die `.env`-Datei und starte das Tool neu.

---

## 🔑 **4. Admin-Funktionalitäten**
### **Wie werde ich Admin?**
Admins werden anhand ihrer **SteamID64** identifiziert. Falls deine SteamID in der `.env` unter `ADMIN_STEAM_IDS` steht, bekommst du Admin-Rechte.

### **Was kann ein Admin?**
✅ **Server hinzufügen & löschen**  
✅ **Alle normalen Funktionen nutzen**  

**🚀 So fügst du einen Server hinzu:**  
1. Logge dich mit **Steam** ein  
2. Trage die **IP-Adresse, Port und RCON-Passwort** ein  
3. Klicke auf **„Server speichern“**  

**🛠 So löschst du einen Server:**  
1. Wähle den Server aus der Liste  
2. Klicke auf **„Server löschen“**  

Falls du kein Admin bist, kannst du **nur Server aus der Liste auswählen, aber keine hinzufügen oder löschen.**

---

## 🎮 **5. Nutzung für Spieler**
### **🔹 Schritte zur Nutzung**
1. Logge dich per Steam-Login ein  
2. Joine auf einen Server und merke dir die **IP & Port**  
3. Wähle deinen Server aus der **Gespeicherte Server**-Liste  
4. Wähle einen **Spielmodus & Karte**  
5. Wähle einen **RCON-Befehl** oder gib ihn manuell ein  
6. Klicke auf **„Send Command“**  

---

## 🛡 **6. Schutz vor Missbrauch**
- **Nur Spieler auf einem Server können RCON-Befehle senden**
- **Admin-Rechte werden anhand der SteamID64 aus der `.env` überprüft**
- **RCON-Zugriff nur mit hinterlegtem Passwort**
- **Kein direktes Speichern von sensiblen Daten in der Datenbank**

---

## 🤖 **Mitwirken**
Falls du helfen willst, das Projekt zu verbessern:
1. **Forke das Repository** auf GitHub  
2. **Erstelle einen Branch** für deine Änderungen  
3. **Erstelle einen Pull-Request** 🚀  

---

## **🎓 Lizenz**
Dieses Projekt steht unter der **MIT-Lizenz**.  

🔗 **Projektseite:** [https://github.com/Egosar93/standalone-rcon-client](https://github.com/Egosar93/standalone-rcon-client)  
📧 **Support:** Falls du Fragen hast, erstelle ein **GitHub-Issue** oder melde dich im Discord.

---

**🚀 Viel Spaß mit dem Standalone RCON Client! 🎮**

