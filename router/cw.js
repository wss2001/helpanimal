const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const {
  addDate,
  calculateDiffTime
} = require('../utils/index')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})

const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
router.get('/getcw', (req, res) => {
  let {
    id
  } = req.query
  cw.findById(id, (err, data) => {
    if (err) {
      res.cc(err)
    } else {
      res.send({
        code: 'ok',
        status: 0,
        data: data[0]
      })
    }
  })
})
router.post('/addfood', urlencodedParser, async (req, res) => {
  let newfood = req.body.form.food
  let _id = req.body.form.id
  let result
  try {
    result = await new Promise((resolve, reject) => {
      cw.findById(_id, (err, date) => {
        if (err) reject(err)
        resolve(date)
      })
    })
  } catch (error) {
    console.log(error)
    res.cc(error)
  }
  let alsoFood = result[0].alsoFood
  let lastfood = addDate(alsoFood, newfood)
    let date = new Date().getTime()
    let foodTime = new Date(alsoFood).getTime()
    console.log(date,foodTime)
    let handleFood = calculateDiffTime(date,foodTime)
    if(date>foodTime){
      handleFood = '0天'
    }
    console.log(handleFood,lastfood,alsoFood)
    
  cw.updateById(_id, {
    alsoFood: lastfood,
    alsoFoodtian:handleFood,
  }, (err, date) => {
    if (err) {
      res.cc(err)
    } else {
      res.send({
        code: 'ok',
        status: 0,
        data: lastfood,
        message: '添加食物成功'
      })
    }
  })
})
//这里得这么导出
module.exports = router