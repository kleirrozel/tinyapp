const express = require("express");

const app = express();

const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

// Shows up on terminal when the server is started
app.listen(PORT, () => {
  console.log(`TinyApp is active on port ${PORT}!`);
});


// GET

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// Route for urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies["username"] };
  
  res.render("urls_index", templateVars);
});


// Route to the form that creates new urls
// Note: Needs to be defined before /urls/:id
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] }; 
  res.render("urls_new", templateVars);
});


// Displays a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; 
  const longURL = urlDatabase[shortURL];
  const username = req.cookies["username"];
  const templateVars = { shortURL, longURL, username};
  res.render("urls_show", templateVars);
});


// Redirects to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; 
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


// POST

// Once a form is submitted from GET /urls/new a request will be made to POST /urls
// Saves the shortURL-longURL key-value pair to the urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


// EDGE CASES:
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?


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


// Allows usernames to be logged in and remembered using cookies
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});