# dotfiles

macOS (Apple Silicon) setup — zsh + starship + kitty, with Cursor and the Claude/Codex CLIs.

## Install on a new machine

```sh
git clone git@github.com:<you>/dotfiles.git ~/dotfiles
cd ~/dotfiles
./install.sh
```

`install.sh` installs Homebrew and everything in the `Brewfile`, symlinks each config
into place, installs Node via nvm plus the global npm packages, and installs the Cursor
extensions. Anything already at a destination path is moved to
`~/.dotfiles-backup/<timestamp>/` rather than overwritten, so it is safe to re-run.

Use `./install.sh --link` to only refresh the symlinks and skip all package installs.

## What's here

| Path | Links to |
|---|---|
| `zsh/.zshrc` | `~/.zshrc` |
| `zsh/.zprofile` | `~/.zprofile` |
| `git/.gitconfig` | `~/.gitconfig` |
| `ssh/config` | `~/.ssh/config` |
| `config/starship.toml` | `~/.config/starship.toml` |
| `config/kitty/kitty.conf` | `~/.config/kitty/kitty.conf` |
| `claude/settings.json` | `~/.claude/settings.json` |
| `codex/config.toml` | `~/.codex/config.toml` |
| `cursor/settings.json` | `~/Library/Application Support/Cursor/User/settings.json` |
| `cursor/keybindings.json` | `~/Library/Application Support/Cursor/User/keybindings.json` |

Package manifests: `Brewfile`, `npm/global-packages.txt`, `cursor/extensions.txt`.

## Not in this repo, by design

- **SSH private keys** — generate a fresh `id_ed25519` per machine and add the public
  half to GitHub. Only `~/.ssh/config` is tracked.
- **CLI credentials** — `~/.codex/auth.json`, `~/.claude.json`. Sign in on the new machine.
- **Machine-local state** — shell history, caches, `~/.nvm`, `~/.bun`, per-project trust
  entries in the Codex config.
- **`~/.config/raycast`** — 254 MB of compiled extension bundles keyed by UUID. Raycast
  syncs settings and extensions through its own cloud sync; enable that instead.
- **Mac App Store / Apple apps** — Xcode, Slack-adjacent Apple bundles, GarageBand,
  iMovie. Install those manually or via `mas`.

## Making changes

Files are symlinked, so edit them in place (`~/.zshrc` etc.) and the repo picks up the
change. Then commit from `~/dotfiles`.

To refresh a package manifest after installing something new:

```sh
brew leaves && brew list --cask   # then update Brewfile
```

Caveat: those commands only see Homebrew-managed installs. Apps downloaded directly
from a vendor's site sit in `/Applications` with no Caskroom receipt and will be missed.
To catch them, diff the two lists:

```sh
ls -1 /Applications | sed 's/\.app$//' | sort > /tmp/apps
brew list --cask | sort > /tmp/casks
comm -23 /tmp/apps /tmp/casks   # installed, but not via brew
```

## Notes

- `.zshrc` references `$HOME/Library/Android/sdk`; those `PATH` entries are harmless if
  Android Studio isn't installed.
- `claude/settings.json` sets `permissions.defaultMode: bypassPermissions`, which lets
  Claude Code run tools without prompting. Intentional, but worth knowing before you
  apply this on a shared or work machine.
- The kitty config uses JetBrainsMono Nerd Font and expects `background_blur`, which
  needs kitty ≥ 0.31 on macOS.
