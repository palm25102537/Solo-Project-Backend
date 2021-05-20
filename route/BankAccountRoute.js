const express = require('express')
const router = express.Router()
const protect = require('../middlewares/protect')
const accountControl = require('../controller/BankAccountController')

router.get('/', protect, accountControl.getAccount)
router.post('/register', protect, accountControl.createAccount)
router.put('/edit/:id', protect, accountControl.editAccount)

module.exports = router