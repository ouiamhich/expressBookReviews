const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user)=>{
  return (user.username === username && user.password === password)
});
if(validusers.length > 0){
  return true;
} else {
  return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username; // Get the username from the session (assuming session is set up)
  const reviewText = req.query.review;

  if (books[isbn]) {
    const book = books[isbn];
    
    // Check if the user has already posted a review for this book
    if (book.reviews[username]) {
      // If the user has already posted a review, modify the existing review
      book.reviews[username] = reviewText;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // If the user has not posted a review or it's a different user, add a new review
      book.reviews[username] = reviewText;
      return res.status(201).json({ message: "Review added successfully" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }

  
 
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.username
  const isbn = req.params.isbn

  if(books[isbn]){
    const book = books[isbn]
    if (book.reviews[username]) {
      delete book.reviews[username]
      return res.status(200).json({message : "Review deleted succesfully"})
    }else{
      return res.status(404).json({message : "Review not found"})
    }
  }else{
    return res.status(404).json({message : "Book not found"})
  }


})


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
