const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const protect = require('../middlewares/protect')
const paymentControl = require('../controller/PaymentController')

router.get('/', protect, paymentControl.getPayment)
router.post('/register', protect, upload.single('image'), paymentControl.createPayment)
router.put('/edit/:id', protect, upload.single('image'), paymentControl.editPayment)

module.exports = router