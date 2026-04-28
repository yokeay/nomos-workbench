#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/release.sh [major|minor|patch]
# Example: ./scripts/release.sh patch  → 0.1.0 → 0.1.1

TYPE=${1:-patch}

if [[ ! "$TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "Error: type must be major, minor, or patch"
  exit 1
fi

# Read current version from package.json
CURRENT=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT"

# Bump version
NEW=$(node -p "
const [major, minor, patch] = '$CURRENT'.split('.').map(Number);
if ('$TYPE' === 'major') console.log(major + 1 + '.0.0');
else if ('$TYPE' === 'minor') console.log(major + '.' + (minor + 1) + '.0');
else console.log(major + '.' + minor + '.' + (patch + 1));
")

echo "New version: $NEW"

# Update package.json
node -e "
const pkg = require('./package.json');
pkg.version = '$NEW';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update src/constants/version.ts
cat > src/constants/version.ts << EOF
export const VERSION = '$NEW';
EOF

# Commit and tag
git add package.json src/constants/version.ts
git commit -m "release: v$NEW"
git tag -a "v$NEW" -m "v$NEW"

echo "Done. Version bumped to $NEW"
echo "Run 'git push && git push --tags' to publish."
