var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

// asks the user which product they would like to buy and how many
function initialPrompt() {
  inquirer.prompt([{
      name: "id",
      type: "input",
      message: "What is the ID of the product you would like to buy?"
    },
    {
      name: "how_many",
      type: "input",
      message: "How many of this item would you like to buy?"
    }])
  .then(function(answer) {
    var query = "SELECT stock_quantity FROM products WHERE ?"
    connection.query(query, { item_id: answer.id }, function(err, res) {
      if (err) throw err;
      var stockLeft = res[0].stock_quantity - answer.how_many
      switch (true) {
        case stockLeft <= 0:
          console.log("Not enough quantity! We only have " + res[0].stock_quantity + " in stock.");
          break;
        case stockLeft > 0:
          console.log(stockLeft);
          break;

      }
    });
  });
}

// presents the user with a list of all available products
function readProducts() {
  console.log("Here's a list of all available products:\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log(res);
    initialPrompt();
  });
}

// let's get this ball a'rollin!
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  readProducts()
});
