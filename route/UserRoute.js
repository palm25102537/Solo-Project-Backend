const express = require('express')
const router = express.Router()
const userControl = require('../controller/UserController')
const protect = require('../middlewares/protect')
const upload = require('../middlewares/upload')

router.post('/register', upload.single('image'), userControl.signUp)
router.post('/', userControl.signIn)
router.put('/', protect, userControl.editProfile)
router.put('/image', protect, upload.single('image'), userControl.editPicturProfile)
router.get('/me', protect, userControl.getMe)
router.get('/', protect, userControl.getUserBy)

module.exports = router