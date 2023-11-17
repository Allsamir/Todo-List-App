require('dotenv').config(); // cofigering env files. 

const express = require('express');

const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const _ = require('lodash');

const connectDB = require('./config/conn.js');

const app = express();

const port = process.env.PORT || 3000;

connectDB(); // connect us to our mongoDB atlas

app.set('view engine', 'ejs'); // setting ejs to use

app.use(bodyParser.urlencoded({
          extended: false
}));

app.use(express.static("public")); // using public directory


const personSchema = mongoose.Schema({
          list: {
                    type: String,
                    required: [true, "Required"]
          }
});

const Person = mongoose.model("allsamir", personSchema);

//  default data

const list_1 = new Person({
          list: "Welcome to your Todo-List",
});

const listSchema = mongoose.Schema({
          name: String,
          list: [personSchema] // there is a push method down here which refers to this list.
})

const List = mongoose.model("List", listSchema);

const defaultItems = [list_1];

// when user gets in our home route this get method is used

app.get('/', (req, res) => {

          let currentDay = "Today";

          // finding items in our Mongodb atlas then callbacking the results and then sending it in our mylist ejs file.

          Person.find()
                    .then(results => {

                              if (results.length == 0) { // if the default items are 0 then we will insert default items and redirect to our home route or you can say that inserting items in our list model's arry.

                                        Person.insertMany(defaultItems);
                                        res.redirect('/');
                              } else {
                                        res.render("mylist", {
                                                  listTitle: currentDay,
                                                  newListItem: results
                                        });
                              }
                    })
                    .catch(err => {
                              console.error(err);
                    })
});


app.get('/contact', (req, res) => {

          res.render('contact');
})

// then the user gets on port and tries to use diffrent route then this get method is used, in this get method express route params is used

app.get("/:newList", (req, res) => {

          const newList = _.capitalize(req.params.newList);

          List.findOne({
                              name: newList
                    })

                    .then(result => {

                              if (!result) { // if the result is not true that mean we will create a new list
                                        const list = new List({
                                                  name: newList,
                                                  list: defaultItems
                                        })

                                        list.save();

                                        console.log(`new item ${list}`)

                              } else { // if it's true than we will not create but just show the existing list
                                        res.render("mylist", {
                                                  listTitle: newList,
                                                  newListItem: result.list
                                        })
                              }
                    })
                    .catch(error => {
                              console.error(error)
                    })

          // res.send(`New-List: ${newList}`);
})

//  creating new item based on their routes

app.post("/", (req, res) => {

          let newItem = req.body.newItem;
          let newRoute = req.body.list;

          const item = new Person({
                    list: newItem
          });

          if (newRoute === "Today") {
                    item.save();

                    res.redirect('/'); // this is for our main route
          } else {
                    List.findOne({
                                        name: newRoute
                              })

                              .then(results => {
                                        results.list.push(item); // pushing this new item to List model's arry which is defined in listSchema
                                        results.save();

                                        console.log("Data successfully inserted");

                                        res.redirect(`/${newRoute}`);
                              })
                              .catch(error => {
                                        console.error(error)
                              })
          }
});


// deleteing item
app.post('/delete', (req, res) => {

          const deleteItemID = req.body.checkbox;

          const newList = req.body.listName;

          if (newList === "Today") {

                    Person.findByIdAndDelete(deleteItemID)

                              .then(deleteData => {

                                        if (deleteData) {
                                                  console.log("Data from main route succesfully deleted")
                                        } else {
                                                  console.log("document not found");
                                        }
                              })
                              .catch(error => {
                                        console.error(error);
                              })

                    res.redirect('/');

          } else {
                    List.findOneAndUpdate({
                                        name: newList
                              }, {
                                        $pull: {
                                                  list: {
                                                            _id: deleteItemID
                                                  }
                                        }
                              })

                              .then(results => {
                                        if (results) {
                                                  console.log(`This data from lists model deleted successfully ${results}`)
                                        } else {
                                                  console.log("Data not found")
                                        }
                              })
                              .catch(error => {
                                        console.error(error);
                              })

                    res.redirect(`/${newList}`);
          }
})

// connection Messages in our console

mongoose.connection.once("open", () => {
          console.log("conncted to Mongodb database")
})

app.listen(port, () => {

          console.log("Server is running " + port);
})