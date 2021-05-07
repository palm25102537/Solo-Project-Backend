const { Customer } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { SECRET_KEY } = process.env

async function protect(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: `You are unauthorized` })
    const payload = jwt.verify(token, SECRET_KEY)
    const data = await Customer.findOne({ where: { id: payload.id } })
    if (!data) return res.status(400).json({ message: 'This user is not found' });
    req.user = data;
    req.payload = payload
    // console.log(req.user)
    next();
  } catch (err) {
    console.log(err)
    next(err);
  }
}

module.exports = protect