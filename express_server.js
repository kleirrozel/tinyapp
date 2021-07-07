const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

/* Middleware */
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

/* URL and User Database */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

/* Functions */
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const generateUserID = () => {
  return "tinyuser_" + Math.random().toString(36).substr(2, 6);
};

const authenticate = (emailToCheck, usersObject) => {
  for (let user in usersObject) {
    if (usersObject.hasOwnProperty(user)) {
      if (emailToCheck === usersObject[user]["email"]) {
      return user;
      }
    }
  }
  return undefined;
};

/* Server Start-up */
app.listen(PORT, () => {
  console.log(`TinyApp is active on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Welcome to TinyApp!");
});

/* GET URLS */ 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route for urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    users: usersDB[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Route to the form that creates new urls
// Note: Needs to be defined before /urls/:id
app.get("/urls/new", (req, res) => {
  const templateVars = { users: usersDB[req.cookies["user_id"]] }; 
  res.render("urls_new", templateVars);
});

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

// Route for registration page
app.get("/register", (req, res) => {
  res.render("registration_index");
});

/* POST URLS */

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

/* LOG in / LOG out / Register */

// Logs in and allows usernames to be remembered through cookies
app.post("/login", (req, res) => {
  res.cookie("user_id", usersDB.email);
  res.redirect("/urls");
});

// Logs out and clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Registration handler
app.post("/register", (req, res) => {
  const userID = generateUserID();
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' && password === ''){
    res.status(400).send('Oops! Looks like you forgot to include your email and password.')
  } else if (authenticate(email, usersDB)) {
    res.status(400).send('Oops! Your email is already registered.')
  } else {
  usersDB[userID] = { id: userID, email, password };
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");
});