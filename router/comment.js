const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const moment = require('moment')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const {
  getCommentBybaseid,
  findUserByUserid
} = require('../router/handle')
// const {jiemi} = require('../utils/index')
const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')
var comment = new mongoControl('animal', 'comment')


// 评论模块
// 获取评论内容
router.get('/getComment', async (req, res) => {
  const {
    id
  } = req.query
  try {
    let result = await getCommentBybaseid(id)
    res.send({
      code: 'ok',
      status: 0,
      data: result,
    })
  } catch (error) {
    res.cc(error)
  }
})
// 提交评论
router.post('/submitComment', urlencodedParser, async (req, res) => {
  let {
    content,
    id,
    baseid
  } = req.body.form
  try {
    let name = await findUserByUserid(id)
    if (name == undefined) {
      res.cc('出错了')
    } else {
      comment.insert([{
        name,
        fid: baseid,
        content,
        userid:id,
        date: moment().format('YYYY-MM-DD  HH:mm')
      }], (err, date) => {
        if (err) {
          res.cc(err)
        } else {
          res.send({
            code: 'ok',
            status: 0,
            data: date
          })
        }
      })
    }
  } catch (error) {
    res.cc([])
  }
})

module.exports = router