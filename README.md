# Capstone Blog Website
My first attempt at a blog website using Node, Express and EJS
A modern, minimal blog platform built with Node.js, Express, and EJS. This project allows users to read, search, and manage blog posts with a clean, responsive interface.

## Features

- 📝 Create, edit, and delete blog posts (admin only)
- 🔍 Search and sort blog posts by title, content, or author
- 📄 Minimal, modern About and Contact pages
- 💡 Responsive design for all devices
- 💾 Blog posts stored in a local JSON file (no database required)
- 🔒 Simple admin authentication (demo credentials)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/capstone-blog.git
   cd capstone-blog
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the server:**
   ```sh
   npm start
   ```
   Or for development with auto-reload:
   ```sh
   npx nodemon index.js
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Usage

- **Home:** View all blog posts, search, and sort.
- **About:** Learn more about the blog.
- **Contact:** Send a message or find contact info.
- **Admin:** Log in with username `admin` and password `admin` to create, edit, or delete posts.

## Project Structure

```
/public
  /images         # Static images (e.g., hero backgrounds)
  /styles         # CSS files
/views
  index.ejs       # Home page
  about.ejs       # About page
  contact.ejs     # Contact page
  blogpost.ejs    # Single blog post
  partials/       # Header and footer
index.js          # Express server
blogPosts.json    # Blog data storage
```

## Customization

- **Styling:** Edit `/public/styles/styles.css` for colors, layout, and branding.
- **Content:** Update EJS templates in `/views` for your own text and structure.
- **Authentication:** For production, replace the demo admin credentials with a secure system.

## License

This project is for educational purposes. Feel free to use, modify, and share!

---

*Built with ❤️ and Express.js*
