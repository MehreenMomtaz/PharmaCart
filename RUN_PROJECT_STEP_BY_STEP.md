# PharmaCart - MongoDB Atlas + Local Run Guide (Windows / PowerShell)

## 1. Requirements
Install Node.js (LTS recommended) and have a MongoDB Atlas account/cluster ready.

## 2. MongoDB Atlas security setup
1. Open Atlas and select the project that contains your PharmaCart cluster.
2. Open **Security -> Database Access** and make sure a database user exists.
3. Open **Security -> Network Access**.
4. Click **Add IP Address -> Add Current IP Address -> Confirm**.
5. Wait until the IP entry becomes active.
6. Open the cluster -> **Connect -> Drivers -> Node.js** and copy the connection string.

If your home/mobile internet changes public IP later, repeat step 4.

## 3. Configure backend/.env
Open `backend/.env` and make sure these values exist:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=YOUR_ATLAS_CONNECTION_STRING
MONGODB_DB_NAME=pharmacart
JWT_SECRET=use_a_long_random_secret_here
CLIENT_URL=http://localhost:5173
ADMIN_NAME=PharmaCart Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Important:
- Replace `<password>` in the Atlas URI with the database user's real password.
- Do not add extra `<` or `>` characters.
- If the database password contains URI-reserved characters, use a URL-encoded password or create a simpler development password.
- `.env` is ignored by Git and should not be uploaded to GitHub.

## 4. Clean old dependencies (recommended for this repaired ZIP)
Open PowerShell in the project folder.

```powershell
cd E:\Downloads\PharmaCart
Remove-Item -Recurse -Force .\backend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\frontend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\backend\package-lock.json -ErrorAction SilentlyContinue
```

The repaired ZIP normally has no `node_modules`, so these commands may simply do nothing.

## 5. Install backend
```powershell
cd backend
npm install
```

## 6. Test Atlas connection before starting the server
```powershell
npm run check
```

Expected ending:
```text
OK  MongoDB Atlas connection successful.
```

If it says Atlas blocked the connection, go back to **Atlas -> Security -> Network Access** and add your current IP.

## 7. Seed sample medicine data
Still inside `backend`:

```powershell
npm run seed
```

This creates/refreshes sample medicine data inside the `pharmacart` database.

## 8. Create an admin account (optional but needed for the Admin Dashboard)
In `backend/.env`, fill:

```env
ADMIN_NAME=PharmaCart Admin
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=YourAdminPassword123
```

Then run:

```powershell
npm run seed:admin
```

Use that email/password on the normal Login page. The account will have the `admin` role.

## 9. Start backend
```powershell
npm run dev
```

Keep this terminal open. Expected:

```text
MongoDB Atlas connected: pharmacart
PharmaCart backend: http://localhost:5000
Health check: http://localhost:5000/api/health
```

Open this in your browser:

```text
http://localhost:5000/api/health
```

It should report the API running and the database connected.

## 10. Install and start frontend
Open a SECOND PowerShell terminal:

```powershell
cd E:\Downloads\PharmaCart\frontend
npm install
npm run dev
```

Vite normally shows a local URL such as:

```text
http://localhost:5173
```

Open that URL in your browser.

## 11. Normal testing order
1. Open the homepage.
2. Sign up a normal user.
3. Login.
4. Browse medicines.
5. Test the demo/sandbox cart and order workflow (no real payment or medicine fulfillment).
6. Open Profile and test a small profile image.
7. If you created the admin account, logout and login as admin.
8. Test Admin Dashboard, medicines, orders, and blogs.

## 12. Common errors
### `Could not connect to any servers in your MongoDB Atlas cluster`
Your current IP is not allowed. Atlas -> Security -> Network Access -> Add Current IP.

### `Authentication failed`
The database username/password in `MONGODB_URI` is wrong. Remember: Atlas database users are separate from the email/password used to log in to the Atlas website.

### Frontend opens but API requests fail
Check:
- backend terminal is still running on port 5000;
- `frontend/.env` contains `VITE_API_URL=http://localhost:5000/api`;
- `backend/.env` contains `CLIENT_URL=http://localhost:5173`;
- restart both servers after changing `.env`.

### Port already in use
Close the old Node terminal/process, or change `PORT` in `backend/.env` and update `VITE_API_URL` in `frontend/.env` to match.

> **Coursework/demo note:** This project is configured as a local/demo application. Its payment/order UI is simulated and is not connected to real payment processing or medicine fulfillment.
