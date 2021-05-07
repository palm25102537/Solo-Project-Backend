const express = require('express')
const router = express.Router()
const categoryControl = require('../controller/CategoryController')
const protect = require('../middlewares/protect')
const { route } = require('./UserRoute')

router.get('/', categoryControl.getCategory)
router.post('/', protect, categoryControl.createCategory)
router.put('/edit/:id', protect, categoryControl.editCategory)

module.exports = router