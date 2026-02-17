# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of FitBody seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do NOT:

- Open a public GitHub issue
- Disclose the vulnerability publicly before it has been addressed
- Exploit the vulnerability beyond what is necessary to demonstrate it

### Please DO:

1. **Email us directly** at security@fitbody.mk with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

2. **Allow us time** to respond and fix the issue before public disclosure

3. **Act in good faith** - don't access or modify data beyond what's necessary to demonstrate the vulnerability

## What to Report

### Security Issues

- Authentication bypass
- Authorization flaws
- SQL injection
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Remote code execution
- Sensitive data exposure
- Insecure direct object references
- Security misconfiguration

### Out of Scope

- Issues in third-party dependencies (report to the dependency maintainers)
- Social engineering attacks
- Physical attacks
- Denial of service attacks
- Issues requiring physical access to a user's device

## Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

## Security Best Practices

### For Users

1. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use environment variables** for sensitive data
   - Never commit `.env.local` or `.env.production`
   - Use strong, unique values for secrets

3. **Enable HTTPS** in production
   - GitHub Pages provides HTTPS automatically
   - Ensure WordPress backend uses HTTPS

4. **Implement rate limiting** on WordPress API
   - Prevent brute force attacks
   - Limit API request frequency

5. **Regular backups** of WordPress database
   - Automated daily backups
   - Test restore procedures

### For Developers

1. **Input Validation**
   - Validate all user inputs
   - Sanitize data before display
   - Use TypeScript for type safety

2. **Authentication**
   - Use secure cookie settings
   - Implement token expiration
   - Use HTTPS-only cookies in production

3. **API Security**
   - Implement proper CORS policies
   - Use authentication for sensitive endpoints
   - Rate limit API requests

4. **Dependencies**
   - Regularly update dependencies
   - Review security advisories
   - Use `npm audit` before releases

5. **Code Review**
   - Review all code changes
   - Check for security issues
   - Use automated security scanning

## Security Features

### Current Implementation

- ✅ HTTPS enforced (GitHub Pages)
- ✅ Secure cookie settings
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ XSS protection (React)
- ✅ Environment variable isolation
- ✅ No sensitive data in client code

### Planned Improvements

- [ ] Rate limiting on API endpoints
- [ ] Two-factor authentication
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Automated security scanning
- [ ] Penetration testing
- [ ] Security audit logging

## WordPress Security

### Required WordPress Security Measures

1. **Keep WordPress Updated**
   - Update WordPress core
   - Update all plugins
   - Update PHP version

2. **Strong Authentication**
   - Use strong passwords
   - Implement 2FA for admin accounts
   - Limit login attempts

3. **File Permissions**
   - Proper file permissions (644 for files, 755 for directories)
   - Restrict wp-config.php access

4. **Database Security**
   - Use unique database prefix
   - Strong database password
   - Limit database user privileges

5. **SSL/TLS**
   - Force HTTPS for admin area
   - Use valid SSL certificate
   - Enable HSTS

6. **Backup Strategy**
   - Automated daily backups
   - Off-site backup storage
   - Regular restore testing

7. **Security Plugins**
   - Install security plugin (Wordfence, Sucuri, etc.)
   - Configure firewall rules
   - Enable malware scanning

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible
5. Credit the reporter (unless they prefer to remain anonymous)

## Security Updates

Security updates will be released as:

- **Patch versions** (1.0.x) for minor security fixes
- **Minor versions** (1.x.0) for moderate security fixes
- **Major versions** (x.0.0) for critical security fixes requiring breaking changes

## Contact

- **Security Email**: security@fitbody.mk
- **General Contact**: fitbody.mk@icloud.com
- **GitHub Issues**: For non-security bugs only

## Acknowledgments

We appreciate the security research community and will acknowledge researchers who report valid security issues (with their permission).

---

Thank you for helping keep FitBody and our users safe!
