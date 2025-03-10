const {faker}=require('@faker-js/faker');
const mysql=require("mysql2");
const express=require("express");
const app=express();
const path=require("path");
const { request } = require('http');
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
const connection=mysql.createConnection({
  host:'localhost',
  user:'root',
  database:'aplicat',
  password:'root',
});
let createRandomUser=()=>{
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};
//home route
app.get("/",(req,res)=>{
  let q=`SELECT count(*) FROM user`;
  try{
    connection.query(q,(err,result)=>{
      if (err)throw err;
      let count=result[0]["count(*)"];
      console.log(count);
      res.render("home.ejs",{count});
    });
  }
  catch(err){
    console.log(err);
    res.send("some erro at db side");
  }
});
//show users route
app.get("/user",(req,res)=>{
  let q=`SELECT * FROM user`;
  try{
    connection.query(q,(err,users)=>{
      if (err)throw err;
     // console.log(result);
      res.render("show.ejs",{users});
    });
  }
  catch(err){
    console.log(err);
    res.send("some erro at db side");
  }
});

//Edit Route
app.get("/user/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if (err)throw err;
      let user=result[0];
      res.render("edit.ejs",{user});
    });
  }
  catch(err){
    console.log(err);
    res.send("some erro at db side");
  }
});
//update Route
app.patch("/user/:id",(req,res)=>{
  let {id}=req.params;
  let {password:formPass,username:newUsername}=req.body;
  let q=`SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if (err)throw err;
      let user=result[0];
      if (formPass!=user.password){
        res.send("wrong Password");
      }else{
        let q2=`UPDATE user SET user='${newUsername} 'WHERE id='${id}'`;
        try{
          connection.query(q2,(err,result)=>{
            if (err)throw err;
            res.redirect("/user");
          });
        }
        catch(err){
          alert("Unsuccesful");
        }
      }
    });
  }
  catch(err){
    console.log(err);
    res.send("some erro at db side");
  }
  //res.send("Updated");
});
//post new user
app.get("/user/post",(req,res)=>{
  res.render("form.ejs");
});
app.post("/user/post",(req,res)=>{
  let {user:name,email:newmail,password:newPassword}=req.body;
  let id=(createRandomUser())[0];
  console.log(id,name,newmail,newPassword);
  let q=`INSERT INTO user(id,user,email,password)VALUES('${id}','${name}','${newmail}','${newPassword}')`;
  try{
    connection.query(q,(err,result)=>{
      if (err)throw err;
      console.log(result);
      res.redirect("/user");
    });
  }
  catch(err){
    console.log(err);
    res.send("some erro at db side");
  }
});
//delete route
app.delete("/user/:id/delete",(req,res)=>{
let {id}=req.params;
let {password:formPass}=req.body;
let q=`SELECT * FROM user WHERE id='${id}'`;
try{
  connection.query(q,(err,result)=>{
    if (err)throw err;
    let user=result[0];
    console.log(formPass,user.password);
    if (formPass!=user.password){
      res.send("wrong Password");
    }else{
      let q=`DELETE FROM user WHERE id='${id}'`;
      try{
        connection.query(q,(err,result)=>{
          if (err)throw err;
          res.redirect("/user");
        });
      }
      catch(err){
        console.log("Unsuccesful");
        res.redirect("/user");
      }
    }
  });
}
catch(err){
  console.log(err);
  res.send("some erro at db side");
}
});
app.listen("8080",()=>{
  console.log("server is listening to port 8080");
});