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
  updatebasecwarr
} = require('../router/handle')
const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')
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
    b.push(a[0])
  }
  res.send({
    code: 'ok',
    status: 0,
    message: '获取宠物基地详细数据成功！',
    data: b,
  })
})

router.post('/login', urlencodedParser, (req, res) => {
  let {
    password,
    phoneNumber
  } = req.body.form
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
    id
  } = req.body.form
  let cwPush = {
    name,
    intro,
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
    console.log('error', error)
  }
})

// 删除宠物
router.post('/removePet', urlencodedParser, async (req, res) => {
  let {
    cwId,
    id
  } = req.body
  console.log(id, cwId);
  cw.deleteById(cwId, (err, date) => {
    if (err) {
      res.cc(err)
      console.log(err);
    } else {
      console.log('cw删除数据成功', cwId);
    }
  })
  // const textPromises = urls.map(async url => {
  //   const response = await fetch(url);
  //   return response;
  // });
  // // 按次序输出
  // for (const textPromise of textPromises) {
  //   console.log(await textPromise);
  // }
  let cwArr = await new Promise((resolve, reject) => {
    cwBase.findById(id, (err, date) => {
      if (err) {
        reject(err)
        res.cc(err)
      }
      resolve(date[0].cwArr)
    })
  })

  let userid = await new Promise((resolve, reject) => {
    cw.findById(id, (err, date) => {
      if (err) {
        reject(err)
        res.cc(err)
      }
      resolve(date[0].userid)
    })
  })

  let userCwArr = await new Promise((resolve, reject) => {
    user.findById(userid, (err, date) => {
      if (err) {
        reject(err)
        res.cc(err)
      }
      resolve(date[0].cw)
    })
  })

  let newUserCwArr = userCwArr.filter(item => item !== cwId)
  let newCwArr = cwArr.filter(item => item !== cwId)
  console.log(newCwArr);

  await user.updateById(userid, {
    cw: newUserCwArr
  }, (err, date) => {
    if (err) {
      reject(err)
    } else {
      resolve('ok')
    }
  })
  cwBase.updateById(id, {
    cwArr: newCwArr
  }, (err, date) => {
    if (err) {
      res.cc(err)
      console.log(err);
    } else {
      res.send({
        code: 'delete pet ok',
        status: 1,
        message: '删除宠物成功',
        data: date
      })
    }
  })
})

//这里得这么导出
module.exports = router