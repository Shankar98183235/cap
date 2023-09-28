const express = require("express");
const app = express();
const passwordHash = require("password-hash");
const request = require('request');
const bodyParser = require("body-parser");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, where } = require("firebase-admin/firestore");
const serviceAccount = require("./key.json");
const API_KEY = "AIzaSyDSVIS-3BL9X-5fXaOVQCi-p2kSPIziMBQ";
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/" + "home.html");
});

app.post("/signupSubmit", function (req, res) {
    const email = req.body.email;
    const userName = req.body.username;
  
    if (!email || !userName) {
      return res.send("Please provide both an email and a username.");
    }
  
  console.log(req.body);
  db.collection("sha")
  .where("userName", "==", req.body.username)
  .get()
  .then((docs) => {
   if (docs.size > 0) {
          return res.send("An account with the same username already exists. Please use a different username.");
   } else {
     db.collection("sha")
     .where("email", "==", req.body.email)
     .get()
     .then((docs) => {
   if (docs.size > 0) {
    return res.send("An account with the same email already exists. Please use a different email.");
   } else {
  db.collection("sha")
  .add({
  userName: req.body.username,
  email: req.body.email,
  password: passwordHash.generate(req.body.password),
  })
   .then(() => {
  res.sendFile(__dirname + "/public/" + "login.html");
  })
  .catch(() => {
  res.send("FAIL");
  });
}
});
 }
 });
});

app.post("/loginSubmit", function (req, res) {
    console.log(req.body); 
    db.collection("sha")
    .where("userName", "==", req.body.username)
    .get()  
      .then((docs) => {
        let verified = false;
        docs.forEach((doc) => {
          verified = passwordHash.verify(req.body.password, doc.data().password);
        });
        if (verified) {
         res.render("dashboard", {result: null });
        } else {
          res.send("Fail");
        }
      });
  });
  
  app.get("/E-BOOkS", function(req, res) {
    if(req.query.eBOOKS && req.query.eBOOKS.length > 0){
    request(
      "https://www.googleapis.com/books/v1/volumes?q=time&printType=magazines&key=AIzaSyDSVIS-3BL9X-5fXaOVQCi-p2kSPIziMBQ",
      function (error, response, body){
       const data = {
        kind:JSON.parse(body).current.kind,
        title:JSON.parse(body).current.title,
        publishedDate:JSON.parse(body).current.publishedDate,
        country:JSON.parse(body).current.country
       };
       res.render("dashboard", { result: data } );
      }
    );
    }
    else{
      res.send("WRONG")
    }
    });
    app.route("/E-BOOkS")
  .get(function(req, res) {
  
    res.send("Please use the search form to search for books.");
  })
  .post(function(req, res) {

    if (req.body.eBOOKS && req.body.eBOOKS.length > 0) {
      const searchQuery = req.body.eBOOKS;

      if (!searchQuery) {
        return res.send("Please enter a search term.");
      }
      const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&printType=magazines&key=AIzaSyDSVIS-3BL9X-5fXaOVQCi-p2kSPIziMBQ`;

      request(apiUrl, function (error, response, body) {
        if (error) {
          return;
        }
      
        const data = JSON.parse(body);
      
        if (data.items && data.items.length > 0) {
          const volumeInfo = data.items[0].volumeInfo;
          const result = {
            kind: data.kind,
            title: volumeInfo.title,
            publishedDate: volumeInfo.publishedDate,
           country: volumeInfo.country,
           description:volumeInfo.description
          };
          res.render("dashboard", { result });
        } else {
          res.send("No results found.");
        }
        
      });
    }
    });   
    
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
