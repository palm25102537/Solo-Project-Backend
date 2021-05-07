const express = require('express')
const router = express.Router()
const transportControl = require('../controller/TransportController')
const protect = require('../middlewares/protect')

router.get('/', protect, transportControl.getTransport)
router.post('/register', protect, transportControl.createTransport)
router.put('/edit/:id', protect, transportControl.editTransport)

module.exports = router