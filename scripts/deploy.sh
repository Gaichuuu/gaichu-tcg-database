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

echo "==> Deploying sitemap..."
rsync -avz sitemap.xml "$REMOTE"

echo "==> Deploying PHP handlers..."
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p ${DEPLOY_PATH}cards ${DEPLOY_PATH}news"
rsync -avz cards/index.php "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}cards/index.php"
rsync -avz news/index.php "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}news/index.php"

echo "==> Deploying NGINX config..."
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p ~/nginx/gaichu.com"
rsync -avz nginx/gaichu.com/nginx.conf "${DEPLOY_USER}@${DEPLOY_HOST}:~/nginx/gaichu.com/nginx.conf"

echo "==> Deploy complete!"
