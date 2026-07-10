#!/bin/bash
# ==========================================
# DesiSexy.in Automated VPS Deployment Script
# ==========================================
set -e

echo "🚀 Starting automated deployment for DesiSexy.in CMS..."

# 1. Check Node.js and PM2
if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 process manager is not installed. Installing PM2 globally..."
    sudo npm install pm2 -g
fi

# 2. Configure Environment variables
if [ ! -f .env ]; then
    echo "📝 Creating environment file (.env)..."
    echo 'DATABASE_URL="file:./dev.db"' > .env
fi

# 3. Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# 4. Initialize Database
echo "🗄️ Setting up SQLite database via Prisma..."
npx prisma db push
npx prisma db seed

# 5. Build Next.js Production Bundle
echo "🏗️ Building Next.js production build..."
npm run build

# 6. Start/Restart background service using PM2
echo "⚡ Starting application via PM2 on port 3000..."
if pm2 list | grep -q "desisexy-cms"; then
    pm2 restart desisexy-cms
else
    pm2 start npm --name "desisexy-cms" -- run start -- -p 3000
fi

# Save PM2 state so it restarts on system reboot
pm2 save || true

echo "========================================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "The application is now running in the background on port 3000."
echo "========================================================="
echo ""
echo "Next steps to link your domain (desisexy.in):"
echo "1. Create Nginx virtual host configuration:"
echo "   sudo nano /etc/nginx/sites-available/desisexy.in"
echo ""
echo "2. Paste the following configuration:"
echo "---------------------------------------------------------"
echo "server {"
echo "    listen 80;"
echo "    server_name desisexy.in www.desisexy.in;"
echo ""
echo "    location / {"
echo "        proxy_pass http://127.0.0.1:3000;"
echo "        proxy_http_version 1.1;"
echo "        proxy_set_header Upgrade \$http_upgrade;"
echo "        proxy_set_header Connection 'upgrade';"
echo "        proxy_set_header Host \$host;"
echo "        proxy_cache_bypass \$http_upgrade;"
echo "    }"
echo "    client_max_body_size 500M;"
echo "}"
echo "---------------------------------------------------------"
echo ""
echo "3. Enable configuration and reload Nginx:"
echo "   sudo ln -s /etc/nginx/sites-available/desisexy.in /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "4. Obtain free SSL (HTTPS) certificate:"
echo "   sudo certbot --nginx -d desisexy.in -d www.desisexy.in"
echo "========================================================="
