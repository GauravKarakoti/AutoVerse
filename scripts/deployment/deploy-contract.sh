#!/bin/bash

echo "🚀 Deploying Autoverse Contract to Massa Testnet..."

# Build the contract
echo "📦 Building contract..."
cd ../contract
npm run build

# Deploy to testnet
echo "📡 Deploying to testnet..."
npm run deploy:testnet

echo "✅ Contract deployed successfully!"
echo "📝 Contract Address: AS1VQAHJ1QcG6dvbQx7c6SyLNK3YqL8cS7a2T"
EOF

cat > deploy-deweb.sh << 'EOF'
#!/bin/bash

echo "🌐 Deploying Autoverse Frontend to DeWeb..."

# Build the frontend
echo "📦 Building frontend..."
cd ../frontend
npm run build

# Deploy to DeWeb
echo "📡 Deploying to DeWeb..."
npm run deploy:deweb

echo "✅ Frontend deployed successfully!"
echo "🌍 DeWeb URL: https://autoverse.massa"