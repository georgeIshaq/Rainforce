#!/bin/bash

# Auto-export n8n workflows and credentials
set -e

echo "📤 Exporting n8n workflows and credentials..."

# Check if n8n container is running
if ! docker ps | grep -q "n8n"; then
    echo "❌ n8n container is not running. Start it with: docker-compose up -d"
    exit 1
fi

# Create directories if they don't exist
mkdir -p ./n8n/demo-data/workflows
mkdir -p ./n8n/demo-data/credentials

# Export workflows
echo "📋 Exporting workflows..."
docker exec n8n n8n export:workflow --output=/demo-data/workflows --separate --all

# Export credentials
echo "🔐 Exporting credentials..."
docker exec n8n n8n export:credentials --output=/demo-data/credentials --separate --all

echo "✅ Export completed!"
echo ""
echo "📝 Next steps:"
echo "1. Review changes: git status"
echo "2. Commit changes: git add n8n/data/ && git commit -m 'Update workflows'"
echo "3. Push changes: git push origin main"
