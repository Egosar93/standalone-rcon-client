from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests
from rcon.source import Client
import os
from dotenv import load_dotenv
import sqlite3



db = SQLAlchemy()

# Laden der Umgebungsvariablen
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  
if not app.secret_key:
    raise ValueError("Secret Key wurde nicht in der .env-Datei gesetzt")

# Steam API Key aus der .env-Datei abrufen
STEAM_API_KEY = os.getenv('STEAM_API_KEY')

if not STEAM_API_KEY:
    raise ValueError("Steam API Key ist nicht in der .env-Datei oder als Umgebungsvariable 'STEAM_API_KEY' gesetzt")

STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'

# SQLite-Konfiguration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///servers.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Datenbankmodell
class Server(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    server = db.Column(db.String(100), nullable=False)
    port = db.Column(db.String(10), nullable=False)
    password = db.Column(db.String(100), nullable=False)

# Initialisiere die Datenbank
@app.before_request
def create_tables():
    # Initialisiere die Tabellen in der Datenbank, falls sie noch nicht existieren
    if not getattr(app, '_db_initialized', False):
        db.create_all()
        app._db_initialized = True

def get_steam_id_from_openid(openid_response):
    claimed_id = openid_response.get('openid.claimed_id', '')
    if claimed_id:
        return claimed_id.split('/')[-1]
    return None

def get_steam_name(steam_id):
    url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={STEAM_API_KEY}&steamids={steam_id}"
    response = requests.get(url)
    if response.status_code == 200:
        try:
            data = response.json()
            players = data.get('response', {}).get('players', [])
            if players:
                return players[0].get('personaname')
        except requests.exceptions.JSONDecodeError:
            return None
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    steam_login_url = f'{STEAM_OPENID_URL}?openid.ns=http://specs.openid.net/auth/2.0&' \
                      f'openid.mode=checkid_setup&openid.return_to={url_for("verify", _external=True)}&' \
                      f'openid.realm={request.host_url}&' \
                      f'openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&' \
                      f'openid.identity=http://specs.openid.net/auth/2.0/identifier_select'
    return redirect(steam_login_url)

@app.route('/verify')
def verify():
    openid_response = request.args.to_dict()
    steam_id = get_steam_id_from_openid(openid_response)
    
    if steam_id:
        steam_name = get_steam_name(steam_id)
        session['steam_id'] = steam_id
        session['steam_name'] = steam_name
        # Setze Rolle basierend auf der SteamID
        session['role'] = 'admin' if steam_id in os.getenv('ADMIN_STEAM_IDS', '').split(',') else 'user'

        return redirect(url_for('index'))
 
    return "Authentifizierung fehlgeschlagen", 403
    
@app.route('/servers', methods=['GET'])
def get_servers():
    try:
        servers = Server.query.all()  # Alle Server aus der Datenbank abrufen
        server_list = [
            {
                "id": server.id,
                "server": server.server,
                "port": server.port,
                "password": server.password  # Passwort wird mitgesendet
            }
            for server in servers
        ]
        return jsonify(server_list), 200
    except Exception as e:
        return jsonify({"error": f"Fehler beim Abrufen der Serverdaten: {str(e)}"}), 500




@app.route('/servers', methods=['POST'])
def add_server():
    if session.get('role') != 'admin':
        return jsonify({"error": "Zugriff verweigert: Nur Admins dürfen Server hinzufügen"}), 403

    data = request.json
    server = data.get("server")
    port = data.get("port")
    password = data.get("password")

    if not server or not port or not password:
        return jsonify({"error": "Alle Felder müssen ausgefüllt sein."}), 400

    # Überprüfen auf Duplikate
    if Server.query.filter_by(server=server, port=port).first():
        return jsonify({"error": "Dieser Server existiert bereits."}), 400

    new_server = Server(server=server, port=port, password=password)
    db.session.add(new_server)
    db.session.commit()
    return jsonify({"message": "Server erfolgreich hinzugefügt"}), 201



@app.route('/servers/<int:server_id>', methods=['DELETE'])
def delete_server(server_id):
    """
    Löscht einen Server aus der Datenbank.
    Nur Admins dürfen Server löschen.
    """
    if session.get('role') != 'admin':
        return jsonify({"error": "Zugriff verweigert: Nur Admins dürfen Server löschen"}), 403

    server = Server.query.get(server_id)
    if not server:
        return jsonify({"error": "Server nicht gefunden"}), 404

    db.session.delete(server)
    db.session.commit()
    return jsonify({"message": "Server erfolgreich gelöscht"}), 200



@app.route('/send-command', methods=['POST'])
def send_command():
    if 'steam_name' not in session:
        return jsonify({"error": "Bitte zuerst über Steam anmelden"}), 403

    data = request.json
    server = data.get("server")
    port = data.get("port")
    password = data.get("password")
    command = data.get("command")

    if not server or not port or not password or not command:
        return jsonify({"error": "Ungültige Anfrage: Fehlende Parameter"}), 400

    try:
        # Verbindung zum Server herstellen
        with Client(server, int(port), passwd=password) as client:
            # Spielerinformationen abrufen
            response = client.run('status')  # Status-Befehl ausführen
            player_names = extract_player_names(response)

            # Überprüfen, ob der eingeloggte Benutzer auf dem Server spielt
            if session['steam_name'] not in player_names:
                return jsonify({"error": "Du bist nicht auf diesem Server verbunden"}), 403

            # Befehl ausführen
            command_response = client.run(command)
            return jsonify({"response": command_response})
    except Exception as e:
        return jsonify({"error": f"Fehler beim Senden des Befehls: {str(e)}"}), 500
@app.route('/start-knife-round', methods=['POST'])
def start_knife_round():
    if 'steam_name' not in session:
        return jsonify({"response": "Bitte zuerst über Steam anmelden"}), 403

    data = request.json
    server = data.get("server")
    port = int(data.get("port", 0))
    password = data.get("password")

    try:
        with Client(server, port, passwd=password) as client:
            # **Spiel neustarten, um eine saubere Knife Round zu starten**
            client.run("mp_restartgame 3")  # 3 Sekunden Restart, um die Knife Round vorzubereiten

            # **Knife-Only Einstellungen setzen**
            client.run("mp_warmup_end")  # Warmup beenden
            client.run("mp_maxrounds 1")  # Nur eine Runde für die Knife Round
            client.run("mp_halftime 0")  # Kein Halbzeitwechsel nach einer Runde
            client.run("mp_freezetime 15")  # 3 Sekunden Freeze Time für Vorbereitungen
            client.run("mp_roundtime 5")  # 5 Minuten Rundenzeit
            client.run("mp_overtime_enable 0")  # Kein Overtime-Modus
            client.run("mp_sideswap 0")  # Seitenwechsel nach der Runde manuell regeln
            client.run("mp_buytime 0")  # Kein Kaufen erlaubt
            client.run("mp_startmoney 0")  # Kein Startgeld
            client.run("mp_death_drop_gun 0")  # Keine Waffen droppen
            client.run("mp_drop_knife_enable 0")  # Kein Messer-Drop
            client.run("mp_give_player_c4 0")  # Kein C4 geben
            client.run("mp_round_restart_delay 3")  # 3 Sekunden Wartezeit nach Rundenende

            # **Waffen entfernen, sodass nur Messer verfügbar sind**
            client.run("mp_t_default_primary \"\"")  # Keine Primärwaffe für T
            client.run("mp_ct_default_primary \"\"")  # Keine Primärwaffe für CT
            client.run("mp_t_default_secondary \"\"")  # Keine Pistole für T
            client.run("mp_ct_default_secondary \"\"")  # Keine Pistole für CT
            client.run("mp_t_default_grenades \"\"")  # Keine Granaten für T
            client.run("mp_ct_default_grenades \"\"")  # Keine Granaten für CT

            response = "Knife Round wurde gestartet! Das Gewinnerteam kann die Seite wählen."
    except Exception as e:
        response = f"Fehler: {str(e)}"

    return jsonify({"response": response})


@app.route('/logout')
def logout():
    session.pop('steam_id', None)
    session.pop('steam_name', None)
    return redirect(url_for('index'))
    
def extract_player_names(status_response):
    """
    Extrahiert die Spielernamen aus der 'status'-Antwort des Servers.
    """
    player_names = []
    for line in status_response.splitlines():
        if "'" in line:  # Spielername ist in Anführungszeichen
            start = line.find("'") + 1
            end = line.rfind("'")
            if start < end:
                player_name = line[start:end]
                player_names.append(player_name)
    return player_names

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
