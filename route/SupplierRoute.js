const express = require('express')
const router = express.Router()
const supplierControl = require('../controller/SupplierController')
const protect = require('../middlewares/protect')

router.post('/register', protect, supplierControl.createSupplier)
router.put('/edit/:id', protect, supplierControl.editSupplier)
router.get('/', protect, supplierControl.getSupplierBy)

module.exports = router