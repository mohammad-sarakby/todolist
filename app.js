//jshint esversion:6

//INCLUDE LIBRARIS

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const http = require('http');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//CONNECT WITH DB

const url = 'mongodb+srv://test:mo.2000sa@cluster0.vmb0jpt.mongodb.net/todolistDB';

mongoose.connect(url)

//CREATE SCHEMA

const itemSchema = {
  name : String
}

const Item= mongoose.model("Item", itemSchema);

const item1= new Item({
  name : "Welcome to your todolist!"
});

const item2= new Item({
  name : "HIt the + button to add a new item."
});

const item3= new Item({
  name : "<-- Hit this to delet an item."
});

const defaultItems = [item1, item2,item3];

const listSchema = {
  name : String,
  items : [itemSchema]
};

const List = mongoose.model("list",listSchema);

//RETURN THE ELEMENT FROM ITEM COLLECTION AND DISPLAY IT ON THE HOME PAGE

app.get("/", function(req, res) {

Item.find().then(
    function(item){
        if (item.length === 0) {
          Item.insertMany(defaultItems).then(
            err => {
              if(err){
                console.log(err);
              }else {
                console.log("Successful");
              }
            }
          )
          res.redirect("/");
        }else {
          res.render("list", {listTitle: "Today", newListItems: item});
        }
     }
    )
});


//RETURN THE ELEMENT FROM LIST COLLECTION AND DISPLAY IT ON THE LIST PAGE

app.get("/:listName", function(req, res) {
  const nameOfList = _.capitalize(req.params.listName) ;

  List.findOne({name :nameOfList}).then(
    foundList => {
      if(!foundList){
        const list = new List({
          name : nameOfList,
          items : defaultItems
        })
        list.save();
        res.redirect("/" + nameOfList);
      }else {
        res.render("list" ,{listTitle: foundList.name, newListItems: foundList.items} )
      }
    }
  )
})


//ADD ELEMENT

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name :listName}).then(
      foundList => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    )
  }

});


//DELETE ELEMENT

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
      Item.deleteOne({_id:checkedItemId}).then(
    err => {
        if (err) {
            console.log(err);
        } else {
            console.log("Succesfylly");
        }
    }
)
   res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName} , {$pull : {items : {_id : checkedItemId}}}).then(
      err => {
        if (err) {
            console.log(err);
        } else {
            console.log("Succesfylly");
        }
    }
    )
    res.redirect("/" + listName);
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000 ;
}

app.listen(port, function() {
  console.log("Success conntect");
});
