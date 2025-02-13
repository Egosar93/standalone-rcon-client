# Basis-Image mit Python
FROM python:3.12-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Kopiere Anforderungen und installiere Abhängigkeiten
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Kopiere Anwendungscode
COPY . .

# Port für die Flask-Anwendung
EXPOSE 5000

# Befehl zum Starten der Anwendung
CMD ["python", "app.py"]
