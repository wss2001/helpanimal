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

//这里得这么导出
module.exports = router