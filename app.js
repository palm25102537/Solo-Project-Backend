require('dotenv').config()
const express = require('express')
const app = express()
const { PORT } = process.env
const port = PORT || 8000
const cors = require('cors')
const error = require('./middlewares/error')
const { sequelize } = require('./models')
const userRoute = require('./route/UserRoute')
const transportRoute = require('./route/TransportRoute')
const supplierRoute = require('./route/SupplierRoute')
const productRoute = require('./route/ProductRoute')
const orderRoute = require('./route/OrderRoute')
const categoryRoute = require('./route/CategoryRoute')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/user', userRoute)
app.use('/transport', transportRoute)
app.use('/supplier', supplierRoute)
app.use('/product', productRoute)
app.use('/order', orderRoute)
app.use('/category', categoryRoute)

app.use("/", (req, res, next) => { res.status(400).json({ message: `Path is not found` }) })

app.use(error)
// sequelize.sync({ force: true }).then(console.log(`Data base sync`))
app.listen(port, () => console.log(`PORT ${port} is listening`))