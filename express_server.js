const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const { findUserByEmail,
  usersDB,
  urlDatabase,
  generateRandomString,
  generateUserID,
  urlsForUser } = require("./helpers");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.static('images'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

/*
GET Routes
*/

// Home page
app.get("/", (req, res) => {
  res.render("home_index");
});

// Route to urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    users: usersDB[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// Route to page that creates new urls
// Note: Needs to be defined before /urls/:id
// If user is logged in, respond with render of urls_new, otherwise, redirect to login
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: usersDB[req.session.user_id]
  };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// Route to registration page
app.get("/register", (req, res) => {
  const templateVars = {
    users: usersDB[req.session.user_id]
  };
  res.render("registration_index", templateVars);
});

// Route to new login page
app.get("/login", (req, res) => {
  const templateVars = {
    users: usersDB[req.session.user_id]
  };
  res.render("login_index", templateVars);
});

// Shortens urls and displays it
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const users = usersDB[req.session.user_id];
  const urlUserID = urlDatabase[shortURL].userID;
  const templateVars = { shortURL, longURL, users, urlUserID};
  res.render("urls_show", templateVars);
});

// Redirects to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  if (longURL === undefined) {
    res.sendStatus(302);
  } else {
    res.redirect(longURL);
  }
});

/*
POST: URLS
*/

// Saves the shortURL-longURL key-value pair to the urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    users: usersDB[req.session.user_id]
  };
  res.redirect(`/urls/${shortURL}`);
});

// Only owners of the url can delete the url they created
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID);

  if (Object.keys(userURLs).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.sendStatus(401);
  }
});

// Only owners of the url can edit the url they created
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID, urlDatabase);

  if (Object.keys(userURLs).includes(id)) {
    urlDatabase[id].longURL = req.body.longURLNew;
    res.redirect("/urls");
  } else {
    res.sendStatus(401);
  }
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
    return res.status(400).render("error400_index");
  } else if (findUserByEmail(email, usersDB)) {
    return res.status(400).render("error400_index");
  } else {
    usersDB[userID] = { id: userID,
      email,
      password: bcrypt.hashSync(password, 10)
    };
    console.log(usersDB);
  }
  req.session.user_id = userID;
  res.redirect("/urls");
});

// Login handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, usersDB);

  if (!user) {
    return res.status(403).render("error403_index");
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).render("error403_index");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

// Logout handler which clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/*
Server start-up
*/
app.listen(PORT, () => {
  console.log(`TinyApp is active on port ${PORT}!`);
});