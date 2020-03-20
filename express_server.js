const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
let cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

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

let hashedPassword ='';
let shortURL ='';
app.post('/register', (req, res) => {
  shortURL = generateRandomString(6)
  users[shortURL] = {id: shortURL,email: req.body.email, password: req.body.password}
  res.cookie('user_id',shortURL)
  res.cookie('email',req.body.email)
  const password = users[shortURL].password // found in the req.params object
 hashedPassword = bcrypt.hashSync(password, 10);
users[shortURL].password = hashedPassword;


  
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

function urlsForUser(id){
  let obj = {}
  for(let short in urlDatabase){
    if(urlDatabase[short].userID === id){
    obj[short] = urlDatabase[short]
    }
    
  }
  return obj
}

const checkAuth = (email, users) => {
  for (let id in users) {
  // console.log(email,'users email',users.email)
    if (email === users.email) {
      console.log(users[id])
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
      urls: urlsForUser(req.cookies.user_id) ,
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
    if(req.cookies.user_id !== urlDatabase[req.params.shortURL].userID){
      res.send('You did not create this url');
    }
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
  //console.log(`users: ${JSON.stringify(users)} userObj: ${JSON.stringify(req.body.email), req.body.password}`)
  //console.log(req.body.email,users[shortURL].email,shortURL)
  if (!checkAuth(req.body.email, users[shortURL])){
    console.log(`no email`)
    res.statusCode = 403
    res.send('email not found please register')
  } else {
    //let user = checkAuth(req.body.email, users)
    //console.log(user)
    if(bcrypt.compareSync(req.body.password,hashedPassword)){
      console.log(`login worked: ${JSON.stringify(users)}`)
      res.cookie('user_id', users[shortURL].id)
      res.redirect(`/urls`);  
    } else {
      console.log(`email password dont match`)
      res.statusCode = 403
      res.send('password doesnt match')
    }
  }

        
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id',users.id)
  res.clearCookie('email',users.email)
 
 res.redirect(`/urls`);         
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});