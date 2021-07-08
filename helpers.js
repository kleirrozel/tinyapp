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

const findUserByEmail = (emailToCheck) => {
  
  for (let userID in usersDB) {
      if (emailToCheck === usersDB[userID].email) {
        return usersDB[userID];
     }
    }
  return false;
};

module.exports = {
  findUserByEmail,
  usersDB
};