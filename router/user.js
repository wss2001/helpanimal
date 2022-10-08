const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const multer = require('multer')
const fs = require('fs')
const mongoControl = require('../dbc').mongoControl
var user = new mongoControl('animal', 'user')
var cw = new mongoControl('animal', 'cw')
// 用户模块
// 登录
router.post('/login', urlencodedParser, (req, res) => {
  let {
    password,
    phoneNumber
  } = req.body.form

  user.find({
    phoneNumber: phoneNumber,
    password: password
  }, (err, date) => {
    if (err) {
      res.cc('err')
    }
    if (date.length == 0) {
      // res.status(404).send(`手机号密码错误,请重新输入`)
      res.cc('手机号密码错误,请重新输入')
    } else {
      // 登陆成功给权限
      // console.log(date[0]._id.toString());
      res.cookie('userToken', date[0]._id.toString(), {
        expires: new Date(Date.now() + 900000)
      })
      // res.status(200).send(date)
      res.send({
        code: 'ok',
        status: 0,
        data: date
      })
    }
  })
})

router.get('/getCwBaseInfo', async (req, res) => {
  let {
    id
  } = req.query
  if (!id) {
    res.cc('id不存在出现错误')
  } else {
    let cc
    try {
      cc = await new Promise((resolve, reject) => {
        user.findById(id, (err, date) => {
          if (err) reject(err)
          resolve(date)
        })
      })
    } catch (error) {
      console.log(error)
      res.cc(error)
    }
    let cwArr = cc[0].cw
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
      message: '获取用户宠物数据成功！',
      data: lastArr,
    })
  }
})

// 获取用户信息
router.get('/getUserInfo', (req, res) => {
  let id = req.query.id
  user.findById(id, (err, date) => {
    if (err) {
      res.cc('发生错误')
    }
    if (date.length == 0) {
      res.cc('资源为存在')
    }
    res.send({
      code: 'ok',
      status: 0,
      message: '获取用户数据成功！',
      data: date,
    })
  })
})

// 注册
router.post('/register', urlencodedParser, (req, res) => {
  let cw = []
  let {
    pass,
    phoneNumber,
    username
  } = req.body.form
  user.insert([{
    password: pass,
    phoneNumber,
    username,
    info: {},
    img:'http://localhost:3007/public/img/cw1.jpg',
    cw: cw
  }], (err, date) => {
    if (err) {
      res.cc('发生错误')
      return
    } else {
      res.cookie('userToken', date.insertedIds[0].toString(), {
        expires: new Date(Date.now() + 9000000)
      })
      res.send({
        code: 'ok',
        status: 0,
        message: '获取用户数据成功！',
        data: date,
      })
    }
  })
})

// 上传照片
router.post('/addjpg', multer({
  //设置文件存储路径
  dest: 'public/img'
}).array('file', 1), (req, res) => {
  let files = req.files;
  let file = files[0];
  let fileInfo = {};
  let path = 'public/img/' + Date.now().toString() + '_' + file.originalname;
  fs.renameSync('./public/img/' + file.filename, path);
  //获取文件基本信息
  fileInfo.type = file.mimetype;
  fileInfo.name = file.originalname;
  fileInfo.size = file.size;
  fileInfo.path = path;
  fileInfo.url = `http://localhost:3009/${path}`
  // console.log(fileInfo)
  res.json({
    code: 0,
    msg: 'OK',
    data: fileInfo
  })
})
router.post('/uploadtx', urlencodedParser, (req, res) => {
  let {
    url,
    id
  } = req.body
  user.updateById(id, {
    img: url
  }, (err, date) => {
    if (err) {
      res.cc('更改图片发生错误')
    } else {
      res.send({
        code: 'ok',
        status: 0,
        data: 'ok'
      })
    }
  })
})

module.exports = router