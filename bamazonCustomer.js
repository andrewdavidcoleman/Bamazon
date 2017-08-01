var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

// presents the user with a list of all available products
function readProducts() {
  console.log("Here's a list of all available products:");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log("| id: " + res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price + " |");
    }
    initialPrompt();
  });
}

// asks the user which product they would like to buy and how many
function initialPrompt() {
  inquirer.prompt([{
      name: "id",
      type: "input",
      message: "What is the id number of the product you would like to buy?"
    },
    {
      name: "how_many",
      type: "input",
      message: "How many of this item would you like to buy?"
    }])
  .then(function(answer) {
    var query = "SELECT stock_quantity FROM products WHERE ?"
    var quantRequested = answer.how_many
    connection.query(query, { item_id: answer.id }, function(err, res) {
      if (err) throw err;
      var inStock = res[0].stock_quantity
      var stockDif = inStock - quantRequested
      switch (true) {
        case stockDif <= 0:
          console.log("Sorry! We only have " + inStock + " in stock.");
        break;
        case stockDif > 0:
          console.log("Order placed!");

          // updates the quantity of the product when an order is successfully placed
          function updateQuantity() {
            var query = connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: stockDif
                },
                {
                  item_id: answer.id
                }
              ],
              function(err, res) {
                // totalPrice();
                console.log(stockDif + " left in stock. Get em while they last chief!");
              }
            );
          }
          updateQuantity();

          // multiplies the item price by the quantity requested by the customer
          function totalPrice() {
            var query = "SELECT price FROM products WHERE ?"
            connection.query(query, { item_id: answer.id }, function(err, res) {
              var itemPrice = res[0].price;
              var totalPrice = itemPrice * quantRequested;
              console.log("Your total will be $" + totalPrice);
            });
          }
          totalPrice();

        break;

      }
    });
  });
}

// let's get this ball a'rollin!
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  readProducts()
});
