const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
//gets all the dishes data 
const list = (req,res,next) =>{

    res.json({ data: dishes });

}

// middleware that makes sure specific dish exists
const dishExists =(req,res,next) =>{
    const {dishId} = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if(foundDish){
        res.locals.dish = foundDish;
        next();
    }
    next({status: 404, message: `Dish id not found:${dishId}`});

}

//gets dishes by id
const read = (req,res,next) =>{
    res.json({data: res.locals.dish})

}// middleware function that makes sure that when creating or updating a dish it has all the properties 
const hasProperties = (propertyName)=>{
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
          return next();
        }
        next({ status: 400, message: `Must include a ${propertyName}` });
      };
}

// middleware that checks price property when creating and updating dishes
const priceCheck = (req,res,next)=>{
    const { data: { price }  = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)){
        return next({
            status: 400,
            message: `price requires a valid number`
        });
    }
    next();
}

//creates a new dish
const create = (req,res,next) =>{
    const { data: { name, description, price,image_url } = {} } = req.body
    const newDish ={
        id:nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}




module.exports={
    list,
    read:[dishExists,read],
    create:[hasProperties("name"),hasProperties("description"),hasProperties("price"),hasProperties("image_url"),priceCheck,create]
}
