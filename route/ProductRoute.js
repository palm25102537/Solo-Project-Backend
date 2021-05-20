const express = require('express')
const router = express.Router()
const productControl = require('../controller/ProductController')
const protect = require('../middlewares/protect')
const upload = require('../middlewares/upload')
router.get('/', protect, productControl.getProductBy)
router.get('/notoken', productControl.getProductBy)
router.post('/register', protect, productControl.createProduct)
router.put('/edit/:id', protect, upload.single('image'), productControl.editProduct)

module.exports = router