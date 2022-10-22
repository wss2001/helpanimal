const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const {jiemi} = require('../utils/index')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})

const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var admin = new mongoControl('animal', 'admin')
router.post('/login', urlencodedParser, (req, res) => {
  let k = req.body.form
  let p = JSON.parse(jiemi(k))
  let {
    pass,
    user
  } = p
  
  admin.find({
    phone:user,
    pass:pass
  }, (err, date) => {
    if (err) {
      res.cc(err)
    } else {
      if (date.length == 0) {
        res.cc('账号密码错误')
      } else {
        res.cookie('admin', date[0]._id.toString(), {
          expires: new Date(Date.now() + 9000000)
        })
        res.send({
          code: 'ok',
          status: 0,
          data: date
        })
      }
    }
  })
})
//获取消息
router.post('/getMessage', urlencodedParser, (req, res) => {
  console.log(req.cookies)
  //在这里进行一个判断来决定是否进行
  admin.find({
    code: 1
  }, (err, date) => {
    if (err) res.cc(err)
    res.send({
      code: 'ok',
      data: date,
      status: 1
    })
  })
})


module.exports = router