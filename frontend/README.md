# Frontend-related Services

This folder contains services required to serve the web interface. It is composed of the following services:

## pydio.web.statics

This is a simple HTTP server for accessing to the basic resources like the interface index, serving the front plugins contents, and handling some specific URLs.

See web/plugins.go

## pydio.grpc.frontend

Provides a couple of frontend-specific REST APIs that are used only by the frontend clients.  It has the particularity to implement a Web Session mechanism (using a CookieStore).

See rest/plugins.go

---

## Node.js Version Management

This project includes a `.nvmrc` file to specify the Node.js version for development and tooling.

### Setup (one-time)

1. **Install nvm** (if not already installed):

   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

   Then restart your terminal or source your shell config:

   ```sh
   source ~/.bashrc  # or ~/.zshrc for macOS
   ```

2. **Install the pinned Node.js version**:

   ```sh
   cd cells
   nvm install
   ```

### Auto-switching (recommended)

Add this to your shell config (`~/.bashrc`, `~/.zshrc`, or equivalent) to auto-switch when entering the directory:

```bash
# Auto-switch Node.js version with nvm
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  
  # Auto-switch on cd
  autoload -U add-zsh-hook
  load-nvmrc() {
    local node_version="$(nvm version)"
    local nvmrc_path="$(nvm_find_nvmrc)"

    if [ -n "$nvmrc_path" ]; then
      local nvmrc_node_version=$(cat "$nvmrc_path")
      if [ "$nvmrc_node_version" = "node" ] && nvm_has "nvm"; then
        nvm alias default node
        nvm use default
      elif nvm_version_path "$nvmrc_node_version" | grep -q "N/A"; then
        nvm install "$nvmrc_node_version"
      fi
      if [ "$node_version" != "$(nvm version)" ]; then
        nvm use
      fi
    elif [ -n "$node_version" ] && [ "$node_version" != "system" ]; then
      echo "Reverting to system Node.js"
      nvm use system
      nvm alias default system
    fi
  }
  add-zsh-hook chpwd load-nvmrc
  load-nvmrc
fi
```
