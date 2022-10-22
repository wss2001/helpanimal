const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const {
  getUserCwArr,
  getBaseCwArr,
  addcw,
  updatebasecwarr,
  deleteCw,
  getUseridBycw,
  getfidBycwid,
  getbrotheridByfid
} = require('../router/handle')
const {jiemi} = require('../utils/index')
const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')
var admin = new mongoControl('animal', 'admin')

router.get('/getbase', (req, res) => {
  cwBase.find({}, (err, data) => {
    if (err) {
      res.cc(err)
    } else {
      res.send({
        code: 'ok',
        status: 0,
        message: '获取宠物基地数据成功！',
        data,
      })
    }
  })
})
router.get('/getCwBaseInfo', async (req, res) => {
  let {
    id
  } = req.query
  try {
    let cwArr = await getBaseCwArr(id)
    // 并发读取远程URL
    const textPromises = cwArr.map(async item => {
      const response = await new Promise((resolve, reject) => {
        cw.findById(item, (err, date) => {
          if (err) reject(err)
          resolve(date)
        })
      })
      return response;
    });
    let b = []
    for (const textPromise of textPromises) {
      let a = await textPromise
      if (a[0] !== undefined) {
        b.push(a[0])
      }
    }
    res.send({
      code: 'ok',
      status: 0,
      message: '获取宠物基地详细数据成功！',
      data: b,
    })
  } catch (error) {
    console.error(error)
    res.cc('根据基地id获取宠物数据失败！')
  }
})

router.post('/login', urlencodedParser, (req, res) => {
  // let {
  //   password,
  //   phoneNumber
  // } = req.body.form
  let k = req.body.form
  let p = JSON.parse(jiemi(k))
  let {
    password,
    phoneNumber
  } = p
  cwBase.find({
    phoneNumber: phoneNumber,
    pass: password
  }, (err, date) => {
    if (err) {
      res.cc(err)
    }
    if (date.length == 0) {
      res.cc(`账号密码错误,请重新输入`)
    } else {
      // 登陆成功给权限
      res.cookie('cwBaseAdminToken', date[0]._id.toString(), {
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
// 增加宠物
router.post('/addpet', urlencodedParser, async (req, res) => {
  let {
    name,
    intro,
    img,
    id,
    birth
  } = req.body.form
  let cwPush = {
    name,
    intro,
    birth,
    lovePeople: '',
    lovePeopleUserName: '',
    state: false,
    alsoFood: 0,
    img: img,
    imgArr: [img],
    fid: id,
    userid: '',
  }
  try {
    let [cwId, cwArr] = await Promise.all([addcw(cwPush), getBaseCwArr(id)])
    console.log(cwArr, cwId);
    cwArr.push(cwId)
    cwBase.updateById(id, {
      baseCw: cwArr
    }, (err, date) => {
      if (err) {
        res.cc(err)
        console.log(err);
      } else {
        res.send({
          code: 'add pet ok',
          status: 1,
          message: '新增宠物成功',
          data: date
        })
      }
    })
  } catch (error) {
    res.cc('新增宠物失败')
    console.log('error', error)
  }
})

// 删除宠物
router.post('/removePet', urlencodedParser, async (req, res) => {
  let {
    cwId,
    baseid
  } = req.body.form
  console.log(baseid, cwId);
  try {
    //删除宠物obj
    let [result, cwArr, userid] = await Promise.all([deleteCw(cwId), getBaseCwArr(baseid), getUseridBycw(cwId)])
    console.log(result, cwArr, userid)
    console.log('=====')
    let newBaseCwArr = cwArr.filter(item => item !== cwId)
    if (userid == '' || !userid) {
      let a = await updatebasecwarr(baseid, newBaseCwArr)
      res.send({
        code: 'delete pet ok',
        status: 1,
        message: '删除宠物成功',
        data: [result]
      })
    } else {
      let userCwArr = await getUserCwArr(userid)
      let newUserCwArr = userCwArr.filter(item => item !== cwId)

      console.log(newBaseCwArr);
      let [a, b] = await Promise.all([updateusercwarr(userid, newUserCwArr), updatebasecwarr(baseid, newBaseCwArr)])
      res.send({
        code: 'delete pet ok',
        status: 1,
        message: '删除宠物成功',
        data: [result]
      })
    }

  } catch (error) {
    console.log(error)
    res.cc('删除宠物失败')
  }
})

//修改宠物信息
router.post('/updatepet', urlencodedParser, (req, res) => {
  let {
    id
  } = req.body.form

})

//宠物救助注册
router.post('/register', urlencodedParser, (req, res) => {
  let {
    phoneNumber,
    pass
  } = req.body.form
  admin.insert([{
    code: 1,
    phoneNumber,
    pass
  }], (err, date) => {
    if (err) {
      res.cc(err)
    } else {
      res.send({
        code: 'ok',
        data: '等待管理员与你确认核实后才能运行',
        status: 1,
      })
    }
  })
})

//这里得这么导出
module.exports = router