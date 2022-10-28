const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const multer = require('multer')
const {jiemi} = require('../utils/index')
const fs = require('fs')
const {getUserMsgById,updateMsgById,getUserById,findUserByUserid,updateUserById} = require('./handle')
const mongoControl = require('../dbc').mongoControl
var user = new mongoControl('animal', 'user')
var cw = new mongoControl('animal', 'cw')
// 用户模块
// 登录
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

  user.find({
    phoneNumber: phoneNumber,
    password: password
  }, (err, date) => {
    if (err) {
      res.cc('err')
    }
    if (date.length == 0) {
      res.cc('手机号密码错误,请重新输入')
    } else {
      // 登陆成功给权限
      res.cookie('userToken', date[0]._id.toString(), {
        expires: new Date(Date.now() + 900000)
      })
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
    try {
      for (let i = 0; i < cwArr.length; i++) {
        let result = await new Promise((resolve, reject) => {
          cw.findById(cwArr[i], (err, date) => {
            if (err) reject(err)
            resolve(date)
          })
        })
        lastArr.push(result[0])
      }
      res.send({
        code: 'ok',
        status: 200,
        message: '获取用户宠物数据成功！',
        data: lastArr,
      })
    } catch (error) {
      res.cc(error)
    }
    
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
      status: 200,
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
    shoucang:[],
    friends:[],
    msg:[],
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
  fileInfo.url = `http://localhost:3007/${path}`
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
//转让宠物
router.post('/changepet',urlencodedParser,async (req,res)=>{
  let {id,myId} = req.body.form
  try {
    let result = await new Promise((resolve, reject) => {
      user.findById(myId, (err, date) => {
        if (err) reject(err)
        resolve(date)
      })
    })
    let beforeCwArr = result[0].cw.filter((item,index)=>item!==id)
    user.updateById(myId,{cw:beforeCwArr},(err,data)=>{
      if(err){
        res.cc(err)
      }
    })
  } catch (error) {
    res.cc(error)
  }
  try {
    let cc = await new Promise((resolve, reject) => {
      cw.updateById(id,{state:false},(err,data)=>{
        if(err) reject(err)
        else{
          resolve(data)
        }
      })
    })
    res.send({
      code:'ok',
      status:0,
      data:cc,
      message:'成功将宠物转让回宠物基地'
    })
  } catch (error) {
    res.cc(error)
  }
})
//给人留言
router.post('/leavemessage',urlencodedParser,async (req,res)=>{
  let {
    content,
    id,
    fid
  } = req.body.form
  try {
    // let [arr,name] = Promise.all[getUserMsgById(fid),findUserByUserid(id)]
    let arr = await getUserMsgById(fid)
    let name = await findUserByUserid(id)
    let obj = {
    state:'pl', //消息类型
    content,  //留言内容
    fid:id,  //来自谁的id
    fname:name  //来自谁的名字
  }
  let result = await updateMsgById(arr,obj,fid)
  if(result){
    res.send({
      code:'ok',
      status:200,
      data:'ok'
    })
  }else{
    res.cc('发送失败')
  }
  } catch (error) {
    console.log(error)
    res.cc('发送失败')
  }
  
})
//发送好友请求
router.post('/addfriend',urlencodedParser,async (req,res)=>{
  let {
    userid,
    myid,
    content
  } = req.body.form
  try {
    let name = await findUserByUserid(myid)
    let userObj = await getUserById(userid)
    if(userObj.friends!==undefined&&userObj.friendRequest!==undefined){
      let {friends,friendRequest} = userObj
      let img = userObj.img ||'http://127.0.0.1:3007/public/img/cw1.jpg'
      let obj = {
        content,
        name,
        fid:myid,
        img,
        state:false
      }
      friendRequest.push(obj)
      user.updateById(userid,{friendRequest:friendRequest},(err,date)=>{
        if(err){
          res.cc('添加请求出错了')
        }else{
          res.send({
            status:200,
            code:'ok',
            data:'ok'
          })
        }
      })
    }
  } catch (error) {
    res.cc(error)
  }
})
//确认添加朋友
router.post('/sureAddFriend',urlencodedParser,async (req,res)=>{
  let {myid,userid} = req.body.form;
  try {
    let userobj = await getUserById(myid);
    let newuserobj = await getUserById(userid)
    if(userobj.friends!==undefined&&newuserobj.friends!==undefined){
      let {friends} = userobj;
      let newFriends = newuserobj.friends;
      newFriends.push(myid)
      friends.push(userid);
      let r1 = await updateUserById(myid,'friends',friends)
      let r2 = await updateUserById(userid,'friends',newFriends)
      if(r1&&r2){
        res.send({
          status:200,
          data:'ok'
        })
      }else{
        res.cc('添加失败')
      }
    }
  } catch (error) {
    console.log('确认出错')
    res.cc(error)
  }

})
//获取用户好友数组
router.get('/getfriends',async (req,res)=>{
  let id = req.query.id;
  try {
    let userobj = await getUserById(id);
    if(userobj.friends!==undefined){
      let {friends} = userobj;
      let userArr = []
      if(friends.length==0){
        res.send({
          code:'ok',
          status:200,
          data:userArr
        })
      }else{
      const userPromises = friends.map(async item=>{
        return await getUserById(item)
      })
      for(const userPromise of userPromises){
        let a = await userPromise;
        if(a!==undefined){
          console.log(a)
          userArr.push(a)
        }
      }
      res.send({
        code:'ok',
        status:200,
        data:userArr
      })
      }
    }
  } catch (error) {
    res.cc('获取好友列表出错')
  }
})
router.get('/getfriendrequest',async (req,res)=>{
  let id = req.query.id;
  console.log(id)
  try {
    let user = await getUserById(id);
    res.send({
      code:'ok',
      status:200,
      data:user.friendRequest ||[]
    })
  } catch (error) {
    res.cc(error)
  }
})
module.exports = router