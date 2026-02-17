# Contributing to FitBody E-commerce Platform

Thank you for your interest in contributing to the FitBody e-commerce platform! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/fitbody-ecommerce.git
   cd fitbody-ecommerce
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/fitbody-ecommerce.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the coding standards below
   - Add comments for complex logic
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to GitHub and create a PR from your fork
   - Fill out the PR template
   - Link any related issues

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use readonly for immutable data

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and prop names
- Extract reusable logic into custom hooks

### File Organization

```
src/
├── components/     # React components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── types/          # TypeScript types
├── utils/          # Utility functions
├── styles/         # CSS files
└── translations/   # i18n files
```

### Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useCart.ts`)
- **Utils**: camelCase (e.g., `formatPrice.ts`)
- **Types**: PascalCase (e.g., `Product`, `CartItem`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Maximum line length: 100 characters
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Follow ESLint rules for consistency

### Comments

- Write self-documenting code when possible
- Add JSDoc comments for public APIs
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes

Example:
```typescript
/**
 * Calculate the total price of cart items including tax
 * 
 * @param items - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total price with tax applied
 */
export const calculateTotal = (items: CartItem[], taxRate: number): number => {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  return subtotal * (1 + taxRate);
};
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(cart): add quantity selector to cart items

fix(api): handle network errors in product fetch

docs(readme): update installation instructions

style(components): format ProductCard component

refactor(hooks): simplify useCart hook logic

perf(images): optimize image loading

test(api): add tests for cart API

chore(deps): update dependencies

ci(actions): add type checking to workflow
```

## Pull Request Process

1. **Update documentation** if you've changed APIs or added features

2. **Add tests** for new functionality (when applicable)

3. **Ensure all checks pass**:
   - Linting: `npm run lint`
   - Type checking: `npm run type-check`
   - Build: `npm run build`

4. **Fill out the PR template** completely

5. **Request review** from maintainers

6. **Address feedback** promptly and professionally

7. **Squash commits** if requested before merging

### PR Title Format

Use the same format as commit messages:
```
feat(cart): add quantity selector to cart items
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

## Testing

### Manual Testing

1. Test your changes in development mode
2. Test the production build locally
3. Test on different browsers
4. Test on mobile devices
5. Test with different screen sizes

### Automated Testing

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Build test
npm run build
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions and components
- Document complex algorithms and business logic
- Keep README.md up-to-date
- Update CHANGELOG.md for significant changes

### API Documentation

- Document new API endpoints in WORDPRESS_API_SETUP.md
- Include request/response examples
- Document error cases

### User Documentation

- Update user-facing documentation
- Add screenshots for UI changes
- Update QUICKSTART.md if setup process changes

## Questions?

- Check existing issues and discussions
- Read the documentation files
- Ask in pull request comments
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FitBody! 🎉
