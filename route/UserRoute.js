const express = require('express')
const router = express.Router()
const userControl = require('../controller/UserController')
const protect = require('../middlewares/protect')

router.post('/register', userControl.signUp)
router.post('/', userControl.signIn)
router.put('/', protect, userControl.editProfile)
router.get('/me', protect, userControl.getMe)
router.get('/', protect, userControl.getUserBy)

module.exports = router