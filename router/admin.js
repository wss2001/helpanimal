const express = require('express')
const router = express.Router()
const moment = require('moment')
const bodyParser = require('body-parser')
const {
  jiemi
} = require('../utils/index')
const {
  getNews
} = require('./handle')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const {
  deleteMsgByID,
  findMsgById,
  getBaseCwArr,
  deleteCw,
  getUseridBycw,
  updateusercwarr
} = require('./handle')

const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var admin = new mongoControl('animal', 'admin')
var news = new mongoControl('animal', 'news')
const Msg = new mongoControl('animal', 'userMsg')

router.post('/login', urlencodedParser, (req, res) => {
  let k = req.body.form
  let p = JSON.parse(jiemi(k))
  let {
    pass,
    user
  } = p

  admin.find({
    phone: user,
    pass: pass
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
//获取基地注册消息
router.get('/getMessage', (req, res) => {
  //在这里进行一个判断来决定是否进行
  admin.find({
    state: '1'
  }, (err, date) => {
    if (err) {
      res.cc(err)
    } else {
      res.send({
        code: 'ok',
        data: date,
        status: 200
      })
    }

  })
})
//获取所有新闻
router.get('/getnews', async (req, res) => {
  try {
    let result = await getNews()
    res.send({
      code: '',
      status: 200,
      data: result
    })
  } catch (error) {
    console.log(error)
    res.cc([])
  }
})
// 获取单个新闻
router.get('/getnewsbyid', (req, res) => {
  let id = req.query.id;
  news.findById(id, (err, date) => {
    if (err) {
      res.cc('出错')
    } else {
      res.send({
        code: 'ok',
        status: 200,
        data: date[0]
      })
    }
  })
})
//向后端发送基地注册消息
router.post('/registercwadmin', urlencodedParser, (req, res) => {
  let {
    phone,
    intro,
    pass
  } = req.body.form;
  admin.insert([{
    state: '1',
    phone,
    intro,
    pass
  }], (err, date) => {
    if (err) {
      res.cc('注册失败')
    } else {
      res.send({
        code: 'ok',
        status: 200,
        data: 'ok'
      })
    }
  })
})
//同意注册基地
router.post('/agree', urlencodedParser, async (req, res) => {
  const {
    id
  } = req.body.form;
  try {
    const Msg = await findMsgById(id)
    const result = await deleteMsgByID(id)
    if (result && Msg) {
      cwBase.insert([{
        phoneNumber: Msg.phone,
        pass: Msg.pass,
        intro: Msg.intro,
        baseName: Msg.baseName,
        address: '',
        img: '',
        baseCw: [],
        PeopleName: '',
        income: 0,
        hot:1
      }], (err, date) => {
        if (err) {
          res.cc('同意失败')
        } else {
          res.send({
            status: 200,
            data:date,
          })
        }
      })
    } else {
      res.cc('同意失败')
    }
  } catch (error) {
    res.cc('同意失败')
  }


})
//拒绝注册基地
router.post('/refuse', urlencodedParser, async (req, res) => {
  const {
    id
  } = req.body.form;
  try {
    const result = await deleteMsgByID(id)
    if (result) {
      res.send({
        status: 200,
        data: '删除成功'
      })
    } else {
      res.cc('删除成功')
    }
  } catch (error) {
    res.cc('删除成功')
  }
})
//删除宠物基地
router.post('/removecwbase', urlencodedParser, async (req, res) => {
  const {
    id
  } = req.body;
  try {
    const cwArr = await getBaseCwArr(id);
    for(let i=0;i<cwArr.length;i++){
      try {
        await deleteCw(cwArr[i])
      } catch (error) {
        console.log('根据宠物id删除宠物失败',cwArr[i])
        res.cc('删除宠物基地失败')
      }
    }
    cwBase.deleteById(id,(err,date)=>{
      if(err){
        res.cc('删除宠物基地失败')
      }else{
        res.send({
          status:200,
          data:'ok'
        })
      }
    })
  } catch (error) {
    res.cc('删除宠物基地失败')
  }
})
// 新增新闻
router.post('/addNews', urlencodedParser, (req, res) => {
  const {
    state,
    content,
    title,
    img
  } = req.body.form;
  news.insert([{
    state,
    content,
    title,
    img,
    date: moment().format('YYYY-MM-DD  HH:mm')
  }], (err, date) => {
    if (err) {
      res.cc('新增新闻出错')
    } else {
      res.send({
        code: 'ok',
        data: 'ok',
        status: 200
      })
    }
  })
})
router.get('/getIncome',async (req,res)=>{
  Msg.find({state:'tw'},(err,date)=>{
    if(err){
      res.cc(err)
    }else{
      res.send({
        status:200,
        data:date
      })
    }
  })
})

module.exports = router