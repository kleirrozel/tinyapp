const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

/* 
Server start-up 
*/
app.listen(PORT, () => {
  console.log(`TinyApp is active on port ${PORT}!`);
});

/* 
Middleware 
*/
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

/* 
Database 
*/
// URL
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

// Users
const usersDB = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


/* 
Functions 
*/
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const generateUserID = () => {
  return "tinyuser_" + Math.random().toString(36).substr(2, 6);
};

const findUserByEmail = (emailToCheck) => {
  for (let user in usersDB) {
    if (usersDB.hasOwnProperty(user)) {
      if (emailToCheck === usersDB[user]["email"]) {
        return user;
      }
    }
  }
  return undefined;
};

/*
GET: URL Routes
*/
// Home/landing page
app.get("/", (req, res) => {
  res.send("Welcome to TinyApp!");
});

// Route to urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: usersDB[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Route to page that creates new urls
// Note: Needs to be defined before /urls/:id
app.get("/urls/new", (req, res) => {
  const templateVars = { users: usersDB[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

// Route to registration page
app.get("/register", (req, res) => {
  res.render("registration_index", {users: null});
});

// Route to new login page
app.get("/login", (req, res) => {
  res.render("login_index", {users: null});
});

/*
Shorten URL and Redirect to longURL
*/

// Shortens urls and displays it
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const users = usersDB[req.cookies["user_id"]];
  const templateVars = { shortURL, longURL, users};
  res.render("urls_show", templateVars);
});

// Redirects to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

/*
POST URLS
*/

// Saves the shortURL-longURL key-value pair to the urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Adds a delete button and redirects back to /urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Adds an edit button and redirects back to /urls page
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURLNew;
  res.redirect("/urls");
});

/*
POST: Register / Login / Logout
*/

// Registration handler
app.post("/register", (req, res) => {
  const userID = generateUserID();
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' && password === '') {
    res.status(400).render("error400_index");
  } else if (findUserByEmail(email)) {
    res.status(400).render("error400_index");
  } else {
    usersDB[userID] = { id: userID, email, password };
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");
});


// Login handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  
  if (!user) {
    res.status(403).render("error403_index");
  } else if (password !== usersDB[user]['password']) {
    res.status(403).render("error403_index");
  } else {
    res.cookie("user_id", user);
    res.redirect("/urls");
  }
});

// Logout handler which clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});