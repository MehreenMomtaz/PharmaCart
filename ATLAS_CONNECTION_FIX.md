# PharmaCart - MongoDB Atlas Connection Fix

## IMPORTANT SECURITY STEP
If a screenshot or chat exposed your MongoDB URI/password or JWT secret, rotate both before continuing.

## 1. Atlas Network Access
Open Atlas -> Security -> Network Access.
For troubleshooting only, add `0.0.0.0/0` (Allow access from anywhere) and wait until it is Active.
After the project works, replace this broad rule with the IP/CIDR ranges you actually need.

Why: a saved single IPv4 address can stop matching if your ISP/VPN changes the public egress IP.

## 2. Atlas Database Access
Open Atlas -> Security -> Database Access.
Create or reset a database user.
Use a new password. If the password contains reserved URI characters, either percent-encode them or use Atlas's generated connection string carefully.

## 3. Copy a fresh connection string
Atlas -> Database -> Connect -> Drivers -> Node.js.
Paste it into `backend/.env` and make the database path `pharmacart`.

Example only:
`MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/pharmacart?retryWrites=true&w=majority&appName=PharmaCart`

## 4. Run the diagnostic
From `backend`:

```powershell
npm install
npm run diagnose
```

Do not run the frontend yet. Fix the diagnostic until it says:
`OK Connected successfully to database: pharmacart`

## 5. Start backend
```powershell
npm run dev
```

Test:
`http://localhost:5000/api/health`

## 6. Seed data (optional)
```powershell
npm run seed
```

## 7. Start frontend
Open a second terminal:

```powershell
cd ..\frontend
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.
