#!/bin/sh
mkdir -p .git/hooks
cp $GOPATH/src/github.com/pydio/cells/tools/scripts/git-hooks/verify.sh .git/hooks/verify.sh
chmod +x .git/hooks/verify.sh
ln -sf ../../.git/hooks/verify.sh .git/hooks/post-checkout
ln -sf ../../.git/hooks/verify.sh .git/hooks/pre-push
ln -sf ../../.git/hooks/verify.sh .git/hooks/commit-msg
echo "✅ Git hooks installed!"
