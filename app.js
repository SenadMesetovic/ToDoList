require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")

const mongoose = require("mongoose");
const app = express();
app.use(express.static(__dirname+"/public"));


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@cluster0.szgub.mongodb.net/todoDB?retryWrites=true&w=majority")
const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const startItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = new mongoose.model("List", listSchema);

const today = new List({
  name: "today",
  items: []
});


// app.get("/", (req, res) => {
//   Item.find((err, foundItems) => {
//     if (!err) {
//       if (foundItems.length === 0) {
//         Item.insertMany(startItems, (err, docs) => {
//           if (err) {
//             res.send(err);
//           }
//           res.redirect("/");
//         });
//       } else {
//         List.find((error,foundLists)=>{
//           if(!error){
//             res.render("list", {
//               listTitle: "Today",
//               newListItems: foundItems,
//               listOfLists:foundLists
//             });
//           }
//         });
//
//       }
//
//     } else {
//       console.log(err);
//     }
//   });
// });

app.get("/",(req,res)=>{
  // List.deleteMany(()=>{});
  res.redirect("/list/Today");
});

app.post("/Today", function(req, res) {
    const newItem = new Item({
      name: req.body.newItem
    });
    newItem.save();
    res.redirect("/");
});

app.get("/list/:listName", function(req, res) {
  List.findOne({
    name: req.params.listName
  }, (err, result) => {
    if (!err) {
      if (!result) {
        const newList = new List({
          name: req.params.listName,
          items: startItems
        });
        newList.save();
        res.redirect("/list/" + req.params.listName);
      } else {

        List.find((error,foundLists)=>{
          if(!error){
            res.render("list", {
              listTitle: result.name,
              newListItems: result.items,
              listOfLists:foundLists
            });
          }
        });

      }
    }
  });
});

app.post("/list/:listName", function(req, res) {
  if (req.params.listName == "Today") {
    const newItem = new Item({
      name: req.body.newItem
    });
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: req.params.listName
    }, (err, result) => {
      if (!err) {
        if (result) {
          const newItem = new Item({
            name: req.body.newItem
          });
          result.items.push(newItem);
          result.save();
          res.redirect("/list/" + req.params.listName);
        }
      }
    })
  }
});

app.post("/delete", (req, res) => {
  const lName = req.body.listName;
  const itemId = req.body.deleteItem;

  if (lName === "Today") {
    Item.deleteOne({
      _id: itemId
    }, (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: lName
    }, {
      $pull: {
        items: {
          _id: itemId
        }
      }
    }, (err, result) => {
      if (!err) {
        res.redirect("/list/" + lName);
      }
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
