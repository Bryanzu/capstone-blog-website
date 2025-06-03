import express from "express";
import session from 'express-session';

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const filePathToBlog = path.join(__dirname, "blogPosts.json");
let message = "";
let jsonData = [];
let isAuthorized = false; 

function readFileFromBlog(req, res, next) {
  fs.readFile(filePathToBlog, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading file");
    }
    // Parse the JSON data

    if (!err && data) {
      try {
        jsonData = JSON.parse(data);
      } catch (parseErr) {
        console.error(parseErr);
        return res.status(500).send("Error parsing JSON data");
      }
    }
    res.locals = {
      blogPosts: jsonData,
      successMessage: message,
      blogType: "Latest Blog Posts",
      isAuthorized: isAuthorized,
    };
    next();
  });
}

app.use(readFileFromBlog);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(session({
    secret: 'bryanzu',      
    resave: false,
    saveUninitialized: true
  }));

app.use((req, res, next) => {
    res.locals.alert = req.session.alert;
    delete req.session.alert;  // remove it after passing to view
    next();
  });


// Home route
app.get("/", (req, res) => {
  res.render("index.ejs", {
    blogPosts: res.locals.blogPosts.reverse()});

  message = ""; // Reset the message after rendering
  jsonData = [];
});

// Login route
app.get("/login", (req, res) => {
  res.render("login.ejs")    
});

// Logout Route
app.post("/logout", (req, res) => {
    isAuthorized = false
    res.locals.isAuthorized = isAuthorized;
    res.redirect("/")
});

// check users credentials
app.post("/authenticate", (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    // For simplicity, using hardcoded credentials
    // In a real application, you would check against a database or other secure storage
    if (!username || !password) {
        return res.json({ success: false, message: "Please enter both username and password" });
    }  

    // Check if the username and password match
    if (username === "admin" && password === "admin") {
        isAuthorized = true; // Set the isAuthorized flag to true
        res.locals.isAuthorized = isAuthorized; // Update the locals variable


        return res.json({ success: true, message: "Login successful" });
    } else {
        return res.json({ success: false, message: "Invalid username or password" });
    }
});

// Submit a new blog post
app.post("/submit", (req, res) => {
  const { title, content, author } = req.body;

  // Create an object to save
  const blogPost = {
    id: jsonData.length, // Use the current length of the array as the ID
    title: title.trim().replace(/ /g, "-"), // Trim whitespace from the title,
    content: content.trim(),
    author: author.trim().trim().replace(/ /g, "-"),
    date: new Date().toLocaleDateString(),
  };
  // Add the new blog post to the array
  jsonData.push(blogPost); // Add the new blog post

  // Write the updated data back to the file
  fs.writeFile(filePathToBlog, JSON.stringify(jsonData), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error writing to file");
    }
  });
  message = "Blog post saved successfully!"; // Set the success message
  res.redirect("/"); // Redirect to the home page after submission
});

//Viewing the blog posts
app.get("/blog/:blogtitle/:id", (req, res) => {
  const id = req.params.id;
  if (id >= 0 && id < jsonData.length) {
    const blogPost = jsonData[id];
    // blogPost.title = title; // Update the title to match the URL paramete
    res.render("blogpost.ejs", { blogPost: blogPost });
  } else {
    res.status(404).json({ message: "Blog post not found" });
  }
});

app.delete("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (id >= 0 && id < jsonData.length) {
    jsonData.splice(id, 1);

    jsonData.forEach((post, index) => {
      post.id = index;
    });
    fs.writeFile(filePathToBlog, JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing to file");
      }
      res.json({ message: "Blog post deleted successfully!" });
    });
  } else {
    res.status(404).json({ message: "Blog post not found" });
  }
});

app.put("/edit", (req, res) => {
  const { id, title, content, author } = req.body;

  if (id >= 0 && id < jsonData.length) {
    const blogPost = jsonData[id];
    (blogPost.title = title.trim().replace(/ /g, "-")),
      (blogPost.content = content.trim());
    (blogPost.author = author.trim().replace(/ /g, "-")),
      (blogPost.date = new Date().toLocaleDateString());

    fs.writeFile(filePathToBlog, JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing to file");
      }
      res.json({
        message: "Blog post updated successfully!",
        blogPost: blogPost,
      });
    });
  } else {
    res.status(404).json({ message: "Blog post not found" });
  }
  jsonData = []; // Reset jsonData after editing
  message = ""; // Reset the message after editing
});

app.get("/search", (req, res) => {
  const query = (req.query.query || "").trim().toLowerCase().replace(/ /g, "-");
  if (!query) {
    console.log("Na me run")
     res.render("index.ejs", {
      blogPosts: [],
      successMessage: "Please enter a search term.",
    });
}

  fs.readFile(filePathToBlog, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading file");
    let posts = [];
    try {
      posts = JSON.parse(data);
    } catch {
      return res.status(500).send("Error parsing JSON");
    }
    // Filter posts by title, content, or author

    const results = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
    );

    // console.log((results.length) ?  "true": "false")
    if (results.length) {
        // console.log("Na me run")
      res.render("index.ejs", {
        blogPosts: results,
        blogType: `Found ${results.length} results for "${query.replace(/-/g," ")}"`,
      });
    } else {
       req.session.alert = {message: `No results found for "${query.replace(/-/g," ")}"`}

        res.redirect("/")
    }
  });
});

app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").trim().toLowerCase();
  if (!query) return res.json([]);
  fs.readFile(filePathToBlog, "utf8", (err, data) => {
    if (err) return res.json([]);
    let posts = [];
    try {
      posts = JSON.parse(data);
    } catch {
      return res.json([]);
    }
    const results = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
    ); //.slice(0, 5); // Limit to 5 results
    res.json(results.slice(0,5));
  });
});

app.get("/sort", (req, res) => {
    const sortBy = req.query.sortBy || "date";
    const order = req.query.order || "desc";
    fs.readFile(filePathToBlog, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        let posts = [];
        try {
            posts = JSON.parse(data);
        } catch {
            return res.status(500).send("Error parsing JSON");
        }

        if (sortBy === "title") {
            posts.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "date") {
            posts.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        if (order === "desc") {
            posts.reverse();
        }
        // console.log(posts)
        res.render("index.ejs", {
            blogPosts: posts,
            blogType: `Sorted by ${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} (${order === "asc" ? "Ascending" : "Descending"})`
        });
    });
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});
app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
// This is a simple Express.js server that serves different routes for a blog website.
// It includes routes for the home page, about page, contact page, blog page, individual blog posts,
// editing blog posts, creating new blog posts, deleting blog posts, and viewing comments on blog posts.
// The server listens on a specified port and responds with a message for each route.
// You can run this code by saving it in a file (e.g., index.js) and running it with Node.js.
// Make sure to install Express.js by running `npm install express` in your project directory before running the code.
// You can also use a package like nodemon to automatically restart the server when you make changes to the code.
// To run the server, use the command `node index.js` or `nodemon index.js` if you have nodemon installed.
// You can then access the server in your web browser at http://localhost:3000.
