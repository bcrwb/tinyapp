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


app.post('/register', (req, res) => {
  let shortURL = generateRandomString(6)
  users[shortURL] = {id: shortURL,email: req.body.email, password: req.body.password}
  res.cookie('user_id',shortURL)
  res.cookie('email',req.body.email)
  
  if(!users[shortURL].email){
    res.statusCode = 400
    res.send('please enter email')
  }else if(req.cookies.email === users[shortURL].email){
    res.statusCode = 400
    res.send('please enter a new email address')
  }else {
  res.redirect('/urls');
  }
  
});

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const checkAuth = (email, users) => {
  for (let id in users) {
    if (email === users[id].email) {
       return users[id];
    }
  }
  return false
}

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
    let templateVars = {
      id: '',
      email: '', 
      password: ''
    };
    res.render("urls_new",templateVars);
  });

  app.post("/urls", (req, res) => {
     //to do : create object to attach as value to short url key
     obj = { longURL: req.body.longURL, userID: req.cookies.user_id }
    urlDatabase[generateRandomString(6)] = obj; 
    res.redirect(`/urls`);         
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { id: '',shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
     const longURL = urlDatabase[req.params.shortURL].longURL
    res.redirect(longURL);
  });
  
  app.post("/urls/:shortURL/delete", (req, res) => {
     delete urlDatabase[req.params.shortURL]
    res.redirect(`/urls`);         
  });

  app.post("/urls/:id", (req, res) => {
     //to do : create object to attach as value to short url key
     obj = { longURL: req.body.newURL, userID: req.cookies.user_id }

    urlDatabase[req.params.id] = obj;
   res.redirect(`/urls`);         
 });

 app.get("/login", (req,res) => {
  let templateVars = {
    id: '',
    email: '', 
    password: ''
  };
   res.render('urls_login', templateVars)
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
  console.log(`users: ${JSON.stringify(users)} userObj: ${JSON.stringify(req.body.email), req.body.password}`)
  if (!checkAuth(req.body.email, users)){
    console.log(`no email`)
    res.statusCode = 403
    res.send('email not found please register')
  } else {
    let user = checkAuth(req.body.email, users)
    if(user.password === req.body.password){
      console.log(`login worked: ${JSON.stringify(user)}`)
      res.cookie('user_id', user.id)
      res.redirect(`/urls`);  
    } else {
      console.log(`email password dont match`)
      res.statusCode = 403
      res.send('password doesnt match')
    }
  }
  // if(req.body.email !== users.email){
  //   res.statusCode = 403
  //   res.send('email not found please register')
  // } else if(req.body.password !== users.password){
  //   res.statusCode = 403
  //   res.send('password doesnt match')
  // } else {
  // } 
        
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id',users.id)
  res.clearCookie('email',users.email)
 
 res.redirect(`/urls`);         
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});