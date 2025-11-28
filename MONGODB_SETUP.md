# MongoDB Setup Instructions

## Your MongoDB Cluster

- Host: `boolder.imaso0t.mongodb.net`
- Database: `climbing_log`

## Steps to Complete Setup

1. **Get your MongoDB credentials:**

   - Go to MongoDB Atlas dashboard
   - Click on "Database Access" in the left sidebar
   - Create a database user (or use existing)
   - Copy the username and password

2. **Update the `.env` file:**
   Open `/backend/.env` and replace the connection string:

   ```
   MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@boolder.imaso0t.mongodb.net/climbing_log?retryWrites=true&w=majority"
   ```

3. **Allow network access:**

   - In MongoDB Atlas, go to "Network Access"
   - Add your IP address or use `0.0.0.0/0` for development (allows all IPs)

4. **Test the connection:**
   ```bash
   cd backend
   npm run dev
   ```

If you see "✅ Database connected", you're good to go!

## Running the Application

Once MongoDB is connected:

```bash
# Terminal 1 - Backend
cd backend
npm run seed   # Optional: add sample gyms/crags
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.
