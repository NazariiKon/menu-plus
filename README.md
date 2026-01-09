# Menu+

## Installation

Clone the repository.

```bash
git clone https://github.com/NazariiKon/menu-plus.git
cd menu-plus
```

### Backend (Server)

```bash
# Create venv
python3 -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate


cd server
pip install -r requirements.txt
uvicorn src.main:app --reload
```

Server runs at `http://localhost:8000`

### Frontend (Client)

In a new terminal:

```bash
cd ../client
npm install
npm run dev
```

Client available at `http://localhost:5173`