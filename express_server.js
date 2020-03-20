const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
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


//DATABASES
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
}


//HELPER FUNCTIONS
const urlsForUser = (id) => {
  let obj = {}
  for(let short in urlDatabase){
    if(urlDatabase[short].userID === id){
    obj[short] = urlDatabase[short]
    }
  }
  return obj
}

const checkAuth = (email) => {
  for (let id in users) {
    if (email === users[id].email) {
      console.log(users[id])
       return users[id];
    }
  }
  return false
}




let hashedPassword ='';
let shortURL ='';
//POST METHOD FOR REGISTER
app.post('/register', (req, res) => {
  if(!req.body.email){
    res.statusCode = 400
    res.send('please enter email')
  }else {
    shortURL = generateRandomString(6)
  users[shortURL] = {id: shortURL, password: req.body.password,email: req.body.email}
  req.session.user_id = shortURL
  req.session.email =req.body.email
  const password = users[shortURL].password 
 hashedPassword = bcrypt.hashSync(password, 10);
users[shortURL].password = hashedPassword;
  res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  if (!checkAuth(req.body.email,users[shortURL].email)){
    console.log(`no email`)
    res.statusCode = 403
    res.send('email not found please register')
  } else {
    if(bcrypt.compareSync(req.body.password,hashedPassword)){
      req.session.user_id = users[shortURL].id
      res.redirect(`/urls`);  
    } else {
      console.log(`email password dont match`)
      res.statusCode = 403
      res.send('password doesnt match')
    }
  }
});

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
    if(!req.session.user_id || !users[req.session.user_id]){
      res.redirect('/register')
      return;
    }
let user = users[req.session.user_id]
    let templateVars = { 
      urls: urlsForUser(req.session.user_id) ,
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
     obj = { longURL: req.body.longURL, userID: req.session.user_id }
    urlDatabase[generateRandomString(6)] = obj; 
    res.redirect(`/urls`);         
  });

  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { id: '',shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    if(req.session.user_id !== urlDatabase[req.params.shortURL].userID){
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
     obj = { longURL: req.body.newURL, userID: req.session.user_id }

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
 

app.post("/logout", (req, res) => {
  req.session = null;
  
 
 res.redirect(`/urls`);         
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});