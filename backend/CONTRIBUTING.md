# Contributing to Daleel Balady

Thank you for your interest in contributing! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 📜 Code of Conduct

Please be respectful and professional in all interactions.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/daleelbalady-backend.git
   cd daleelbalady-backend
   ```
3. **Install dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔄 Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile endpoint
fix: resolve authentication bug
docs: update API documentation
style: format code with prettier
refactor: simplify error handling
test: add unit tests for auth service
chore: update dependencies
```

## 📏 Coding Standards

### JavaScript/Node.js

- Use **ES6+ features**
- Follow **ESLint** rules
- Use **Prettier** for formatting
- Write **JSDoc comments** for functions
- Use **async/await** over promises

### Code Style

```javascript
// ✅ Good
const getUserById = async (id) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    logError(error, { context: 'getUserById' });
    throw error;
  }
};

// ❌ Bad
function getUserById(id) {
  return prisma.user.findUnique({ where: { id } }).catch(e => console.error(e));
}
```

### File Organization

- One component/service per file
- Keep files under 300 lines
- Use descriptive names
- Group related files in directories

### Error Handling

```javascript
// Always use structured error handling
try {
  // Operation
} catch (error) {
  logError(error, { context: 'operation', data: { id } });
  throw new CustomError('User-friendly message', 500);
}
```

## 🧪 Testing

### Writing Tests

```javascript
describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);
    
    expect(response.body).toHaveProperty('token');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

- Aim for **>80%** coverage
- Test happy paths and error cases
- Mock external dependencies
- Use meaningful test descriptions

## 🔍 Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met (if applicable)

## 📤 Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests and linting**
   ```bash
   npm run lint
   npm test
   ```

3. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Use descriptive title
   - Reference related issues
   - Describe changes made
   - Add screenshots (if UI changes)
   - Request reviewers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Related Issues
Closes #123
```

## 🐛 Issue Reporting

### Bug Reports

Include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, etc.
- **Screenshots**: If applicable
- **Error Logs**: Stack traces

### Feature Requests

Include:
- **Description**: Clear feature description
- **Use Case**: Why this feature is needed
- **Proposed Solution**: How you envision it working
- **Alternatives**: Other solutions considered

## 📚 Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add JSDoc comments for new functions
- Update CHANGELOG.md

## 🏗️ Architecture Guidelines

### Adding New Routes

```javascript
// routes/example.js
import express from 'express';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Implementation
  } catch (error) {
    logger.error('Error in example route', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Database Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Update related models/types
4. Update tests

## 🎨 UI/UX Guidelines

- Follow Material Design principles
- Ensure mobile responsiveness
- Support RTL for Arabic
- Use consistent spacing
- Maintain accessibility (WCAG 2.1)

## 🌍 Internationalization

- All user-facing text should support Arabic and English
- Use translation keys
- Test both LTR and RTL layouts

## 📊 Performance Guidelines

- Optimize database queries
- Use indexes appropriately
- Implement caching where beneficial
- Monitor bundle sizes
- Use lazy loading for heavy components

## 🔒 Security Guidelines

- Never commit secrets
- Validate all inputs
- Sanitize outputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP Top 10

## 💬 Communication

- GitHub Issues for bugs/features
- GitHub Discussions for questions
- Discord for real-time chat
- Email for security issues

## 🙏 Thank You!

Your contributions make Daleel Balady better for everyone!

---

**Questions?** Contact us at dev@daleelbalady.com

