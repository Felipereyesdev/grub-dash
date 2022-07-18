const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//this function gets all the orders

const list = (req, res, next) => {
  res.json({ data: orders });
};

//this middleware function makes sure that the specific order exists

const orderExists = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  next({ status: 404, message: `Order id not found:${orderId}` });
};

//this function read a specific order

const read = (req, res, next) => {
  res.json({ data: res.locals.order });
};

// this middleware function makes sure when creating a order the order object has all the properties
const hasProperties = (propertyName) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
};

// this middleware checks the the array inside the create order and update order
const checkDish = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) && dishes.length > 0) {
    return next();
  }
  next({ status: 400, message: "Order must include at least one dish" });
};

// checks quantity of dishes
const dishQuantity = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  for (let i = 0; i < dishes.length; i++) {
    if (!dishes[i].quantity || !Number.isInteger(dishes[i].quantity)) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  next();
};

//this is the create order function
const create = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

//validates order id 
const validateOrderId = (req,res,next)=>{
    const {orderId} = req.params;
    const { data: { id } = {} } = req.body
    if(orderId === id || !id){
       return next();
    }
    next({status: 400,message:`Order id does not match route id. Order: ${id}, Route: ${orderId}`})

}

//validating the status
const checkStatus = (req, res, next) => {
  const { data: { status } = {} } = req.body;
//   const errors = ["pending", "preparing", "out-for-delivery","delivered"]
//  you can also do errors.indexOf(status) === -1
  if (!status || status === "" || !status.includes("pending") &&
  !status.includes("preparing") &&
  !status.includes("out-for-delivery") &&
  !status.includes("delivered")) {
    return next({status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"});
  }else if(status === "delivered"){
    return next({status: 400, message: "A delivered order cannot be changed"});
  }
  next();
};


//updating the order
const update = (req, res, next) => {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  //updating the order
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;

  res.json({ data: order });
};

// validating the status of the order before deleting 
const checkDeletingStatus =(req,res,next) =>{
    const order = res.locals.order
    if(order.status !=="pending"){
        return next({status: 400, message: "An order cannot be deleted unless it is pending"});
    }
    next();
}

//deleting order 
function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedPastes = orders.splice(index, 1);
    res.sendStatus(204);
  }


module.exports = {
  list,
  read: [orderExists, read],
  create: [
    hasProperties("deliverTo"),
    hasProperties("mobileNumber"),
    hasProperties("dishes"),
    checkDish,
    dishQuantity,
    create,
  ],
  update: [
    orderExists,
    validateOrderId,
    checkStatus,
    hasProperties("deliverTo"),
    hasProperties("mobileNumber"),
    hasProperties("dishes"),
    checkDish,
    dishQuantity,
    update
  ],
  delete:[orderExists,checkDeletingStatus,destroy]
};
