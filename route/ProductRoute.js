const express = require('express')
const router = express.Router()
const productControl = require('../controller/ProductController')
const protect = require('../middlewares/protect')
router.get('/', productControl.getProductBy)
router.post('/register', protect, productControl.createProduct)
router.put('/edit/:id', protect, productControl.editProduct)

module.exports = router