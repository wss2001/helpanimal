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
  updateusercwarr,
  deleteCw,
  getUseridBycw,
  getfidBycwid,
  getBaseById,
  updateCwBase,
  updateCw,
  getCwImgArr
} = require('../router/handle')
const {jiemi} = require('../utils/index')
const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')
const Msg = new mongoControl('animal', 'userMsg')
var admin = new mongoControl('animal', 'admin')

// 获取所有宠物基地信息
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
// 根据id获取宠物基地信息
router.get('/getbaseByid', async (req, res) => {
  try {
    let id = req.query.id;
    const cwBase = await getBaseById(id)
    res.send({
      status:0,
      data:cwBase
    })
  } catch (error) {
    res.cc(error)
  }
 


})
//获取宠物基地的宠物信息
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
            else{
              resolve(date)
            }
          })
        })
        return response;
      });
    let b = []
    for (const textPromise of textPromises) {
      try {
        let a = await textPromise
      if (a[0] !== undefined) {
        b.push(a[0])
      }
      } catch (error) {
        console.error(error)
      }
    }
    res.send({
      code: 'ok',
      status: 0,
      message: '获取宠物基地详细数据成功！',
      data: b,
    })
  } catch (error) {
    console.error('ss')
    res.cc('根据基地id获取宠物数据失败！')
  }
})
// 根据查询条件/获取基地的宠物列表
router.post('/postCwBaseInfo',urlencodedParser, async (req, res) => {
  let {
    id
  } = req.query
  let {name,state}  =req.body
  try {
    let cwArr = await getBaseCwArr(id)
    // 并发读取远程URL
      const textPromises = cwArr.map(async item => {
        const response = await new Promise((resolve, reject) => {
          cw.findById(item, (err, date) => {
            if (err) reject(err)
            else{
              resolve(date)
            }
          })
        })
        return response;
      });
    let b = []
    for (const textPromise of textPromises) {
      try {
        let a = await textPromise
      if (a[0] !== undefined) {
        b.push(a[0])
      }
      } catch (error) {
        console.error(error)
      }
    }
    if(state!==''){
      b = b.filter(item=>item.state==state)
    }
    if(name!==''){
      b = b.filter(item=>item.name==name)
    }
    res.send({
      code: 'ok',
      status: 0,
      message: '获取宠物基地详细数据成功！',
      data: b,
    })
  } catch (error) {
    console.error('ss')
    res.cc('根据基地id获取宠物数据失败！')
  }
})
// 修改宠物基地自身信息
router.post('/changeBaseInfo',urlencodedParser,async (req,res)=>{
  let {id,baseName,address,intro,img,PeopleName} = req.body
  cwBase.updateById(id,{baseName,address,intro,img,PeopleName},(err,data)=>{
    if(err){
      res.cc('err')
    }else{
      res.send({
        code: 'ok',
        status: 200,
        message: '修改宠物基地管理数据成功！',
        data: data,
      })
    }
  })
})
// 修改宠物基地获得利益
router.post('/changeBaseTotal',urlencodedParser,async (req,res)=>{
  let {id,income} = req.body
  cwBase.updateById(id,{income},(err,data)=>{
    if(err){
      res.cc('err')
    }else{
      res.send({
        code: 'ok',
        status: 200,
        message: '修改宠物基地管理获得利益成功！',
        data: data,
      })
    }
  })
})
router.post('/login', urlencodedParser, (req, res) => {
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
    birth,
    baseName
  } = req.body.form
  let cwPush = {
    name,
    intro,
    birth,
    lovePeople: '',
    lovePeopleUserName: '',
    state: false,
    alsoFood: birth,
    img: img,
    imgArr: [img],
    fid: id,
    userid: '',
    alsoFoodtian:0,
    cwBase:baseName
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
      } else {
        res.send({
          code: 'add pet ok',
          status: 200,
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
  // console.log(baseid, cwId);
  try {
    //删除宠物obj
    let userid = await getUseridBycw(cwId)
    let [result, cwArr] = await Promise.all([deleteCw(cwId), getBaseCwArr(baseid)])
    console.log(result, cwArr, userid)
    console.log('=====')
    let newBaseCwArr = cwArr.filter(item => item !== cwId)
    if (userid == '' || !userid) {
      let a = await updatebasecwarr(baseid, newBaseCwArr)
      res.send({
        code: 'delete pet ok',
        status: 200,
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
router.post('/updatepet', urlencodedParser, async (req, res) => {
  let {
    id,
    name,
    intro,
    img,
    birth
  } = req.body
  const result = await updateCw(id,{name,intro,img,birth})
  if(result){
    res.send({
      status:200,
      message:'修改成功',
      data:result
    })
  }else{
    res.cc(result)
  }

})
// 给宠物添加图片
router.post('/updatepetImg', urlencodedParser, async (req, res) => {
  let {
    id,
    imgUrl
  } = req.body
  let imgArr = await getCwImgArr(id)
  imgArr.push(imgUrl)
  const result = await updateCw(id,{imgArr})
  if(result){
    res.send({
      status:200,
      message:'添加图片成功',
      data:result
    })
  }else{
    res.cc(result)
  }

})

//宠物救助注册
router.post('/register', urlencodedParser, (req, res) => {
  let {
    phoneNumber,
    pass,
    baseName
  } = req.body.form
  admin.insert([{
    code: 1,
    phoneNumber,
    pass,
    baseName
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
//获取Msg里的收益
router.post('/getmoney',urlencodedParser,async(req,res)=>{
  let {baseid} = req.body.form;
  Msg.find({baseid:baseid},(err,date)=>{
    if(err){
      res.cc('搜寻失败')
    }else{
      res.send({
        status:200,
        data:date
      })
    }
  })
})
//更新热度
router.post('/updateHot',urlencodedParser,async(req,res)=>{
  let id = req.body.id;
  const cwbase = await getBaseById(id)
  if(cwbase){
    let hot = cwbase.hot;
    const result = await updateCwBase(id,{hot:hot+1})
    if(result){
      res.send({
        status:200,
        data:'ok'
      })
    }
  }
})
//这里得这么导出
module.exports = router