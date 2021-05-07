const express = require('express')
const router = express.Router()
const orderControl = require('../controller/OrderController')
const protect = require('../middlewares/protect')

router.post("/register", protect, orderControl.createOrder)
router.put('/edit/:id', protect, orderControl.updateOrder)
router.get("/", protect, orderControl.getOrderBy)
router.get('/bestseller', orderControl.getBestSeller)
module.exports = router