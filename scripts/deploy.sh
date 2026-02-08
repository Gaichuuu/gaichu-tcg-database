set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.deploy.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .deploy.env not found. Create it with:"
  echo '  DEPLOY_USER="your-user"'
  echo '  DEPLOY_HOST="your-host"'
  echo '  DEPLOY_PATH="~/your-path/"'
  exit 1
fi

source "$ENV_FILE"
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

echo "==> Building project..."
npm run build

echo "==> Deploying dist/ to ${REMOTE}..."
rsync -avz --delete \
  dist/ \
  "$REMOTE"

echo "==> Deploying .htaccess and sitemap..."
rsync -avz .htaccess sitemap.xml "$REMOTE"

echo "==> Deploying PHP handlers..."
rsync -avz --mkpath cards/index.php "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}cards/index.php"
rsync -avz --mkpath news/index.php "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}news/index.php"

echo "==> Deploy complete!"
