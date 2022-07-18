const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllow = require("../errors/methodNotAllowed")

// TODO: Implement the /dishes routes needed to make the tests pass
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllow)
router.route("/").get(controller.list).post(controller.create).all(methodNotAllow);


module.exports = router;
