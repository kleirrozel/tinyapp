const usersDB = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

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

// TO DO:
// Refactor your helper function to take in both the users email and the users database. If you don't have a helper function yet, create one now using the example above.
const findUserByEmail = (emailToCheck, usersDB) => {
  
  for (let userID in usersDB) {
      if (emailToCheck === usersDB[userID].email) {
        return usersDB[userID];
     }
    }
  return false;
};

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const generateUserID = () => {
  return "tinyuser_" + Math.random().toString(36).substr(2, 6);
};

const urlsForUser = (id) => { //Returns an object of urls specific to the userID
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].users && urlDatabase[shortURL].users.id === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLs;
};

module.exports = {
  findUserByEmail,
  usersDB,
  urlDatabase,
  generateRandomString,
  generateUserID,
  urlsForUser
};