const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
let cookieParser = require('cookie-parser')

app.use(cookieParser())

app.set("view engine","ejs");

function generateRandomString(length) {
  let string = ''
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
let charactersLength = characters.length;
for (let i = 0; i < length; i++ ) {
  string += characters.charAt(Math.floor(Math.random() * charactersLength));
}
return string;
}




const users = { 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
  // }
}

app.post('/register')

app.post('/register', (req, res) => {
  let shortURL = generateRandomString(6)
  users[shortURL] = {id: shortURL,email: req.body.email, password: req.body.password}
  res.cookie('user_id',shortURL)
  res.cookie('email',req.body.email)
 res.redirect('/urls');
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
  
  app.get("/urls", (req, res) => {
    if(!req.cookies.user_id || !users[req.cookies.user_id]){
      res.redirect('/register')
      return;
    }
    let user = users[req.cookies.user_id]
    let templateVars = { 
      urls: urlDatabase ,
      id: user.id,
      email: user.email, 
      password: user.password
    };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.post("/urls", (req, res) => {
     
    urlDatabase[shortURL] = req.body.longURL; 
    res.redirect(`/urls`);         
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[shortURL]
    res.redirect(longURL);
  });
  
  app.post("/urls/:shortURL/delete", (req, res) => {
     delete urlDatabase[req.params.shortURL]
    res.redirect(`/urls`);         
  });

  app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.newURL
   res.redirect(`/urls`);         
 });

 app.get("/login", (req,res) => {
   res.render('urls_login', {user:{}})
 })

 app.get("/register", (req,res) => {
   let templateVars = {
    id: '',
    email: '', 
    password: ''
  };
   
  res.render('urls_register', templateVars)
})
 app.post("/login", (req, res) => {
  res.cookie('user_id',users.id)
 
 res.redirect(`/urls`);         
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id',users.id)
 
 res.redirect(`/urls`);         
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});