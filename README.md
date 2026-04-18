# ASL-Translator

Quick setup notes for the team for now. We can make this cleaner later, but this should be enough to get everyone running without confusion.

---

# Todo

- Video files should be stored on the frontend, in the public folder
	- one folder to hold words, another to hold letters
	- management/comands/sync_asl_videos.py, services.py, and tests.py need to be updated with this location
	
- Connect english->asl frontend to backend

- re-train YOLO model (current version is very inaccurate)

---

## Project structure

- `ASL_frontend` = React frontend
- `ASL_backend` = Django + Django REST Framework backend

## What you need

- Node.js installed
- Python `3.11.x` installed
- Git

## First time setup

Clone the repo and go into the project:

```powershell
git clone <repo-url>
cd ASL-Translator
```

Make sure `llama3.2:3b` is installed
```powershell
ollama run llama3.2:3b
```

### Frontend setup

Open one terminal:

```powershell
cd ASL_frontend
npm install
npm run dev
```

That should start the frontend dev server. Vite usually gives you a local URL in the terminal.

### Backend setup
Open Ollama process, then

Open another terminal:

```powershell
cd ASL_backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend should run at:

```text
http://127.0.0.1:8000/
```

Test API route:

```text
http://127.0.0.1:8000/api/health/
```

## Every time after that

Frontend:

```powershell
cd ASL_frontend
npm run dev
```

Backend:
Open Ollama process, and in terminal
```powershell
cd ASL_backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

## Important notes

- Use Python `3.11.x` for the backend.
- Do not push `venv`, `.env`, or `db.sqlite3`.
- If backend packages change, run:

```powershell
pip freeze > requirements.txt
```

- If models change, run:

```powershell
python manage.py makemigrations
python manage.py migrate
```

- Then commit the migration files.

## If something is not working

- Make sure you are inside the correct folder before running commands.
- Make sure the backend venv is activated.
- If `pip install -r requirements.txt` fails, check that Python is `3.11.x`.
- If frontend fails, try `npm install` again inside `ASL_frontend`.

## Check ASL video database

```
Add videos > ASL_backend > assets then run the commands below.
powershell
cd ASL_backend
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py sync_asl_videos
.\venv\Scripts\python.exe manage.py runserver
http://127.0.0.1:8000/assets/hello.mp4
```
