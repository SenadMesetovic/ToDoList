const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js")

const mongoose = require("mongoose");
const app = express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoDB")
const itemSchema = new mongoose.Schema({
  name:String
});

const Item = new mongoose.model("Item",itemSchema);

const item1=new Item({
  name: "Welcome to your ToDoList!"
});

const item2=new Item({
  name: "Hit the + button to add a new item."
});

const item3=new Item({
  name: "<-- Hit this to delete an item."
});

const startItems = [item1, item2, item3];

app.get("/", (req, res) => {
  Item.find((err,foundItems)=>{
    if(!err){
      if(foundItems.length===0){
        Item.insertMany(startItems,(err,docs)=>{
          if(err){
            res.send(err);
          }
          res.redirect("/");
        });
      }else{
        res.render("list",{
          listTitle: "Today",
          newListItems:foundItems
        });
      }

    }else{
      console.log(err);
    }
  });
});

app.post("/", function(req, res) {
  const newItem = new Item({
    name: req.body.newItem
  });
  newItem.save();
  res.redirect("/");
});

app.post("/delete",(req,res)=>{
  console.log(req.body.deleteItem);
  Item.deleteOne({_id:req.body.deleteItem},(err,result)=>{
    if(err){
      res.send(err);
    }else{
      res.redirect("/");
    }
  });
});
app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  })
});

app.post("/work", function(req, res) {
  let item = req.body.newItem;
  workItems.push(item)
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
