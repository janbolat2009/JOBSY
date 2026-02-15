## Description
Briefly describe the changes in this PR.

## 🚀 Production-Safe Code Checklist
Before submitting, please ensure:
- [ ] No hardcoded `localhost` or `127.0.0.1` in the code.
- [ ] No hardcoded `http://` URLs (unless they are external public APIs).
- [ ] Used relative paths for internal API calls (e.g., `/api/...`).
- [ ] No sensitive keys (`OPENAI_API_KEY`, etc.) are exposed to the client.
- [ ] Env variables follow the naming convention (`VITE_` prefix for client).

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Unit tests passed (if applicable)
