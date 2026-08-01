#!/usr/bin/env bash
#
# Bootstrap a fresh macOS machine from this dotfiles repo.
#
#   ./install.sh          symlink configs + install packages
#   ./install.sh --link   symlink configs only (skip brew/npm)
#
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP="$HOME/.dotfiles-backup/$(date +%Y%m%d-%H%M%S)"
LINK_ONLY=false
[[ "${1:-}" == "--link" ]] && LINK_ONLY=true

info() { printf '\033[0;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[0;33m!!\033[0m %s\n' "$1"; }

# link <source-in-repo> <destination-in-home>
link() {
  local src="$DOTFILES/$1" dest="$2"

  if [[ ! -e "$src" ]]; then
    warn "missing in repo, skipping: $1"
    return
  fi

  mkdir -p "$(dirname "$dest")"

  # Already pointing where we want it.
  if [[ -L "$dest" && "$(readlink "$dest")" == "$src" ]]; then
    echo "    ok   ${dest/#$HOME/~}"
    return
  fi

  # Something real is in the way - move it aside rather than clobbering it.
  if [[ -e "$dest" || -L "$dest" ]]; then
    mkdir -p "$(dirname "$BACKUP/${dest#$HOME/}")"
    mv "$dest" "$BACKUP/${dest#$HOME/}"
    echo "    bak  ${dest/#$HOME/~} -> ${BACKUP/#$HOME/~}"
  fi

  ln -s "$src" "$dest"
  echo "    link ${dest/#$HOME/~}"
}

# --- Homebrew ---------------------------------------------------------------
if ! $LINK_ONLY; then
  if ! command -v brew >/dev/null 2>&1; then
    info "Installing Homebrew"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  eval "$(/opt/homebrew/bin/brew shellenv)"

  info "Installing packages from Brewfile"
  brew bundle --file="$DOTFILES/Brewfile"
fi

# --- Symlinks ---------------------------------------------------------------
info "Linking dotfiles"
link zsh/.zshrc            "$HOME/.zshrc"
link zsh/.zprofile         "$HOME/.zprofile"
link git/.gitconfig        "$HOME/.gitconfig"
link ssh/config            "$HOME/.ssh/config"
link config/starship.toml  "$HOME/.config/starship.toml"
link config/kitty/kitty.conf "$HOME/.config/kitty/kitty.conf"
link claude/settings.json  "$HOME/.claude/settings.json"
link codex/config.toml     "$HOME/.codex/config.toml"
link cursor/settings.json    "$HOME/Library/Application Support/Cursor/User/settings.json"
link cursor/keybindings.json "$HOME/Library/Application Support/Cursor/User/keybindings.json"

# Suppress the "Last login:" banner on every new shell.
touch "$HOME/.hushlogin"

# --- Node -------------------------------------------------------------------
if ! $LINK_ONLY; then
  if [[ ! -d "$HOME/.nvm" ]]; then
    info "Installing nvm"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi

  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"

  info "Installing Node LTS + global packages"
  nvm install --lts
  nvm alias default lts/*
  xargs npm install -g < "$DOTFILES/npm/global-packages.txt"
fi

# --- Cursor extensions ------------------------------------------------------
if ! $LINK_ONLY && command -v cursor >/dev/null 2>&1; then
  info "Installing Cursor extensions"
  while read -r ext; do
    [[ -n "$ext" ]] && cursor --install-extension "$ext" || true
  done < "$DOTFILES/cursor/extensions.txt"
else
  $LINK_ONLY || warn "cursor CLI not on PATH - install extensions manually from cursor/extensions.txt"
fi

# --- Manual follow-ups ------------------------------------------------------
cat <<'EOF'

Done. Remaining manual steps:

  1. SSH key (never stored in this repo):
       ssh-keygen -t ed25519 -C "your@email.com"
       pbcopy < ~/.ssh/id_ed25519.pub   # then add at github.com/settings/keys

  2. Sign in to the AI CLIs:  claude  /  codex

  3. Android/React Native work: install Android Studio, then confirm
     ~/Library/Android/sdk exists (referenced by .zshrc).

  4. Restart your shell:  exec zsh

EOF
