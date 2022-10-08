const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})

const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
router.get('/getbase', (req, res) => {
  cwBase.find({}, (err, data) => {
    if (err) return res.cc(err)
    // console.log('data',data)
    res.send({
      code: 'ok',
      status: 0,
      message: '获取宠物基地数据成功！',
      data,
    })
  })
})
router.get('/getCwBaseInfo', async (req, res) => {
  let {
    id
  } = req.query
  let cc
  try {
    cc = await new Promise((resolve, reject) => {
      cwBase.findById(id, (err, date) => {
        if (err) reject(err)
        resolve(date)
      })
    })
  } catch (error) {
    console.log(error)
    res.cc(error)
  }

  let cwArr = cc[0].baseCw
  let lastArr = []
  for (let i = 0; i < cwArr.length; i++) {
    let result = await new Promise((resolve, reject) => {
      cw.findById(cwArr[i], (err, date) => {
        if (err) reject(err)
        resolve(date)
      })
    })
    lastArr.push(result[0])
  }
  // console.log(lastArr);
  res.send({
    code: 'ok',
    status: 0,
    message: '获取宠物基地详细数据成功！',
    data: lastArr,
  })
})

router.post('/login', urlencodedParser, (req, res) => {
  let {
    password,
    phoneNumber
  } = req.body.form
  // console.log(password,phoneNumber);
  cwBasePeople.find({
    phoneNumber: phoneNumber,
    password: password
  }, (err, date) => {
    if (err) {
      res.cc(err)
    }
    if (date.length == 0) {
      res.status(404).send(`账号密码错误,请重新输入`)
    } else {
      // 登陆成功给权限
      res.cookie('cwBaseAdminToken', cwBaseAdminToken.getToken(), {
        expires: new Date(Date.now() + 9000000)
      })
      res.send({
        code: 'ok',
        status: 0,
        message: '获取宠物基地管理数据成功！',
        data: date,
      })
    }
  })
})

//这里得这么导出
module.exports = router