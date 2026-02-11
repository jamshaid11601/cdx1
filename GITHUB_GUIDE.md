# 📚 GitHub Guide for Beginners

A simple guide to managing your Codexier project on GitHub.

---

## 🌟 What is GitHub?

GitHub is a platform for:
- **Version Control**: Track all changes to your code
- **Collaboration**: Work with team members
- **Backup**: Your code is safely stored in the cloud
- **Deployment**: Automatically deploy when you push code

---

## 🚀 Basic Workflow

### 1. **Check Status**
See which files have changed:
```bash
git status
```

### 2. **Stage Changes**
Add files to commit:
```bash
# Add specific file
git add components/shared/RequestMessaging.tsx

# Add all changes
git add .
```

### 3. **Commit Changes**
Save your changes with a message:
```bash
git commit -m "Fix: Updated messaging system for custom requests"
```

### 4. **Push to GitHub**
Upload your commits to GitHub:
```bash
git push origin main
```

---

## 🌲 Branching Strategy

### Why Use Branches?
- Keep `main` branch clean (production-ready)
- Test new features safely
- Work on multiple things at once

### Common Branch Types

| Branch Name | Purpose | Example |
|------------|---------|---------|
| `main` | Production code | Always stable |
| `develop` | Integration | Merge features here first |
| `feature/name` | New feature | `feature/payment-gateway` |
| `bugfix/name` | Bug fix | `bugfix/login-error` |
| `hotfix/name` | Urgent fix | `hotfix/security-patch` |

### Creating Branches

```bash
# Create and switch to new branch
git checkout -b feature/new-dashboard

# Make changes, commit them
git add .
git commit -m "Add new dashboard layout"

# Push branch to GitHub
git push origin feature/new-dashboard
```

### Merging Branches

```bash
# Switch to main branch
git checkout main

# Merge your feature
git merge feature/new-dashboard

# Push to GitHub
git push origin main
```

---

## 📝 Writing Good Commit Messages

### Format
```
Type: Short description (50 chars max)

Longer explanation if needed (wrap at 72 chars)
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, no code change
- `refactor:` Code change without fixing/adding
- `test:` Adding tests
- `chore:` Maintenance

### Examples
```bash
git commit -m "feat: Add custom request messaging"
git commit -m "fix: Resolve null pointer in checkout"
git commit -m "docs: Update README with setup instructions"
```

---

## 🔄 Pull Requests (PRs)

### When to Use
- Merging feature branches into `main` or `develop`
- Getting code reviewed before merging
- Working with a team

### How to Create PR

1. Push your branch to GitHub:
   ```bash
   git push origin feature/my-feature
   ```

2. Go to GitHub repository
3. Click "Pull Requests" → "New Pull Request"
4. Select your branch → Click "Create Pull Request"
5. Add description → Click "Create"
6. Wait for review or merge yourself

---

## 🛠️ Common Commands Cheat Sheet

```bash
# Check current branch
git branch

# Switch branch
git checkout branch-name

# Create new branch
git checkout -b new-branch

# Delete branch
git branch -d branch-name

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset HEAD~1

# Discard all local changes
git restore .

# Pull latest changes from GitHub
git pull origin main

# View remote repository
git remote -v
```

---

## ⚠️ Troubleshooting

### "Permission Denied" Error
```bash
# Configure Git with your GitHub credentials
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### "Merge Conflict"
1. Open the conflicted file
2. Look for `<<<<<<<`, `=======`, `>>>>>>>`
3. Decide which changes to keep
4. Remove conflict markers
5. Stage and commit:
   ```bash
   git add conflicted-file.tsx
   git commit -m "fix: Resolve merge conflict"
   ```

### "Diverged Branches"
```bash
# Pull and merge
git pull origin main

# Or pull and rebase
git pull --rebase origin main
```

---

## 🎯 Best Practices

1. **Commit Often**: Small, frequent commits are better
2. **Pull Before Push**: Always pull latest before pushing
3. **Test Before Commit**: Make sure code works
4. **Don't Commit Secrets**: Never commit passwords or API keys
5. **Use .gitignore**: Exclude node_modules, .env, etc.
6. **Write Clear Messages**: Future you will thank you

---

## 📚 Learn More

- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://training.github.com/downloads/github-git-cheat-sheet.pdf)
- [Interactive Git Tutorial](https://learngitbranching.js.org)
