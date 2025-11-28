#!/bin/bash

echo "🧗 Setting up Climbing Log MVP..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Make sure you have PostgreSQL running."
    echo "   You can install it with: brew install postgresql (macOS)"
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your PostgreSQL database URL"
    echo "   Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/climbing_log\""
    echo ""
    read -p "Press enter when you've updated the .env file..."
fi

echo ""
echo "🗄️  Running database migrations..."
npm run prisma:generate
npm run prisma:migrate

echo ""
read -p "Would you like to seed the database with sample gyms and crags? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
fi

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
