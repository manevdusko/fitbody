# FitBody.mk E-commerce Platform

[![Deploy to GitHub Pages](https://github.com/yourusername/yourrepo/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/yourrepo/actions/workflows/deploy.yml)

A modern, professional e-commerce platform built with React, Next.js, and integrated with WordPress/WooCommerce backend at api.fitbody.mk.

## ⚡ Quick Start

New to the project? Check out [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide!

Need command references? See [COMMANDS.md](COMMANDS.md) for all useful commands.

## 🚀 Features

- **Modern React Frontend**: Built with Next.js 14, TypeScript, and Framer Motion for smooth animations
- **WordPress Integration**: Seamless integration with WordPress CMS via REST API
- **WooCommerce E-commerce**: Full product management, cart, and checkout functionality
- **Dealer Portal**: Special pricing and access for registered dealers
- **Responsive Design**: Fully responsive design optimized for all devices
- **Dark Theme**: Professional dark mode design with blue accents
- **Performance Optimized**: Fast loading with image optimization and efficient code

## 🛠 Technology Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS, Styled Components
- **Animations**: Framer Motion
- **State Management**: React Query, Context API
- **Backend**: WordPress with WooCommerce
- **API**: WordPress REST API / WPGraphQL

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fitbody-ecommerce.git
   cd fitbody-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your WordPress/WooCommerce configuration.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

The application fetches data from `api.fitbody.mk` WordPress API:

```bash
# WordPress API (production)
WORDPRESS_API_URL=https://api.fitbody.mk/wp-json/wp/v2
WOOCOMMERCE_API_URL=https://api.fitbody.mk/wp-json/wc/v3

# Site configuration
NEXT_PUBLIC_SITE_URL=https://yourusername.github.io/yourrepo
NEXT_PUBLIC_APP_NAME=FitBody.mk
```

### WordPress Setup

See [WORDPRESS_API_SETUP.md](WORDPRESS_API_SETUP.md) for:
- Required WordPress plugins
- Custom REST API endpoints
- CORS configuration
- Security setup

## 🎨 Design System

### Color Palette
- **Primary**: Orange (#D4962E)
- **Background**: Black (#0a0a0a)
- **Cards**: Dark Gray (#1a1a1a)
- **Text**: White (#ffffff)
- **Secondary Text**: Gray (#a1a1aa)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, clean sans-serif
- **Body**: Clear, readable fonts

## 🔐 Dealer Portal

The platform includes a special dealer portal with:

- **Secure Login**: Dedicated dealer authentication
- **Special Pricing**: Automatic dealer price display
- **Bulk Orders**: Enhanced ordering capabilities
- **Exclusive Access**: Dealer-only products and promotions

## 📱 Responsive Design

The platform is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### GitHub Pages (Current Setup)

The site is configured to deploy automatically to GitHub Pages and fetch data from `api.fitbody.mk`.

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Automatic Deployment**
   - GitHub Actions automatically builds and deploys
   - View progress in the Actions tab
   - Site goes live at your GitHub Pages URL

3. **Configuration**
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions
   - See [WORDPRESS_API_SETUP.md](WORDPRESS_API_SETUP.md) for WordPress configuration

### Alternative: Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Local Build Test

```bash
# Test the production build locally
npm run build

# Check the output in the 'out' folder
npm run deploy:test
```

## 📊 Performance Optimization

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting with Next.js
- **Lazy Loading**: Components and images loaded on demand
- **Caching**: React Query for API response caching

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email fitbody.mk@icloud.com or create an issue in this repository.

## 🔗 Links

- [Documentation Index](DOCUMENTATION_INDEX.md) - Complete guide to all documentation
- [Live Demo](https://fitbody.mk)
- [API Documentation](https://api.fitbody.mk/wp-json)

---

Built with ❤️ for the fitness community in Macedonia.