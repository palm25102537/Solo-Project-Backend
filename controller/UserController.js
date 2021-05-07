const { sequelize, Customer } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { SECRET_KEY, EXPIRE, SALT_ROUND } = process.env
const ValidateError = require('../middlewares/ValidateError')


async function signUp(req, res, next) {

  const { name, userName, password, confirmPassword, email, address, phoneNumber } = req.body
  const isEmail = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
  const isPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
  const transaction = await sequelize.transaction()

  if (!name) throw new ValidateError(`Your name is required`, 400)
  if (name.trim() === "") throw new ValidateError(`Your name can not be blank`, 400)
  if (!userName) throw new ValidateError(`Username is required`, 400)
  if (userName.trim() === "") throw new ValidateError(`Username can not be blank`, 400)
  if (!password) throw new ValidateError(`Password is required`, 400)
  if (password.trim() === "") throw new ValidateError(`Password can not be blank`, 400)
  if (!confirmPassword) throw new ValidateError(`Confirm password is required`, 400)
  if (password !== confirmPassword) throw new ValidateError(`Confirm password must match with password`, 400)
  if (!email) throw new ValidateError(`Your email is required`, 400)
  if (email.trim() === "") throw new ValidateError(`Email can not be blank`, 400)
  if (!phoneNumber) throw new ValidateError(`Your phone number is required`, 400)
  if (isNaN(phoneNumber)) throw new ValidateError(`Your phone number must be number`, 400)
  if (!isEmail.test(email)) throw new ValidateError('Please check your email', 400)
  if (!isPassword.test(password)) throw new ValidateError(`Password must has minimum eight characters and at least one upper case English letter, one lower case English letter, one number and one special character`, 400)

  const hashPassword = await bcrypt.hash(password, parseInt(SALT_ROUND))
  try {

    const sendData = {
      name,
      userName,
      password: hashPassword,
      email,
      address,
      phoneNumber,
      isAdmin: 'Not admin',
      status: 'Member'
    }

    const data = await Customer.create(sendData, { transaction })

    const payload = {
      id: data.id,
      name: data.name,
      userName: data.username,
      isAdmin: data.isAdmin
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: parseInt(EXPIRE) })

    await transaction.commit()

    res.status(200).json({ message: `Register successfully`, data, token })

  } catch (err) {
    transaction.rollback()
    next(err);
  }
}

async function signIn(req, res, next) {

  const { username, password } = req.body
  const isEmail = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
  if (!username) return res.status(400).json({ message: `username is required` })
  if (username.trim() === "") return res.status(400).json({ message: `username can not be blank` })
  if (!password) return res.status(400).json({ message: `Password is required` })
  if (password.trim() === "") return res.status(400).json({ message: `Password can not be blank` })

  let search = { where: {} }

  let data;

  try {

    if (isEmail.test(username)) {

      search.where = { email: `${username}` }

      data = await Customer.findOne(search)

    } else {

      search.where = { username: `${username}` }

      data = await Customer.findOne(search)

    }

    if (!data) return res.status(400).json({ message: `Username or password is wrong` })
    const isMatch = await bcrypt.compare(password, data.password)
    if (!isMatch) return res.status(400).json({ message: `Password is wrong` })

    const payload = {
      id: data.id,
      name: data.name,
      userName: data.username,
      isAdmin: data.isAdmin
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: parseInt(EXPIRE) })

    res.status(200).json({ message: `Sign In success`, data, token })

  } catch (err) {
    console.log(err)
    next(err);
  }
}
async function editProfile(req, res, next) {
  try {

    const { id } = req.user
    const { name, userName, oldpassword, newpassword, confirmPassword, email, address, phoneNumber, status, isAdmin } = req.body
    const isEmail = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
    const isPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
    const beforeUpdate = await Customer.findOne({ where: { id } })
    let newHashPassword;
    if (!beforeUpdate) return res.status(400).json({ message: `This supplier is not found` })

    if (status) {
      if (status.trim() === "") return res.status(400).json({ message: `Client status can not be blank` })
      if (req.payload.isAdmin !== 'Admin') return res.status(400).json({ message: 'Only Admin can change member status' })
    }

    if (isAdmin) {
      if (req.payload.isAdmin !== 'Admin') return res.status(400).json({ message: 'Only Admin can change admin status' })
      if (isAdmin.trim() === "") return res.status(400).json({ message: `Every members must have role` })
    }

    if (userName) {
      if (userName.trim() === "") return res.status(400).json({ message: `Your username can not be blank` })
    }
    if (name) {
      if (name.trim() === "") return res.status(400).json({ message: `Your name can not be blank` })
    }

    if (phoneNumber) {
      if (isNaN(phoneNumber)) return res.status(400).json({ message: `Your phone number must be number` })
      if (phoneNumber.trim() === "") return res.status(400).json({ message: `Your phone number can not be blank` })
    }


    if (newpassword) {
      if (newpassword !== confirmPassword) return res.status(400).json({ message: `New Password must equal to confirm password` })
      if (newpassword.trim() === "") return res.status(400).json({ message: `Password can not be blank` })
      if (!oldpassword) return res.status(400).json({ message: `Old password is required` })
      if (!isPassword.test(newpassword)) return res.status(400).json({ message: `Password must has minimum eight characters and at least one upper case English letter, one lower case English letter, one number and one special character` })
      const isMatch = await bcrypt.compare(oldpassword, beforeUpdate.password)
      if (!isMatch) return res.status(400).json({ message: `Please check old password` })

      newHashPassword = await bcrypt.hash(newpassword, parseInt(SALT_ROUND))

    }

    if (email) {
      if (!isEmail.test(email)) return res.status(400).json({ message: 'Please check your email' })
      if (email.trim() === "") return res.status(400).json({ message: `Your email can not be blank` })
    }


    const sendData = {
      name: name || beforeUpdate.name,
      userName: userName || beforeUpdate.userName,
      password: newHashPassword || beforeUpdate.password,
      email: email || beforeUpdate.email,
      address: address || beforeUpdate.address,
      phoneNumber: phoneNumber || beforeUpdate.phoneNumber,
      status: status || beforeUpdate.status,
      isAdmin: isAdmin || beforeUpdate.isAdmin
    }

    await Customer.update(sendData, { where: { id } })
    res.status(200).json({ message: `Updated` })

  } catch (err) {
    console.log(err)
    next(err);
  }
}
async function getUserBy(req, res, next) {
  //แก้ให้ เฉพาะ token ของ admin ใช้ function นี้ได้เท่านั้น
  try {
    const { sort, item, desc, single, lim } = req.query

    const { isAdmin } = req.payload


    if (isAdmin !== "Admin") return res.status(400).json({ messag: `You are not admin` })

    let search = { where: { status: `Member` } }

    let data;

    let condition = {}

    if (single && !sort) search.where = { id: `${single}` }



    sort ? condition = { ...search, order: [[`${item}`, desc ? "DESC" : "ASC"]], limit: lim ? +lim : null } : condition = { ...search }

    single ? data = await Customer.findOne(condition) : data = await Customer.findAll(condition)



    if (data === null) return res.status(400).json({ message: `There is no this transport` })
    return res.status(200).json({ data })

  } catch (err) {
    console.log(err)
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const { sort, item, desc, single, lim } = req.query

    const { id } = req.payload

    let search = { where: { id } }

    let data;

    let condition = {}


    sort ? condition = { ...search, order: [[`${item}`, desc ? "DESC" : "ASC"]], limit: lim ? +lim : null } : condition = { ...search }

    data = await Customer.findOne(condition)



    if (data === null) return res.status(400).json({ message: `There is no this transport` })
    return res.status(200).json({ data })

  } catch (err) {
    console.log(err)
    next(err);
  }
}

module.exports = {
  signUp,
  signIn,
  editProfile,
  getUserBy,
  getMe
}