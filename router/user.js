const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
var mailer = require('../utils/sendMail');
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const multer = require('multer')
const {jiemi} = require('../utils/index')
const {createToken,verifyToken} = require('../utils/jwt')
const fs = require('fs')
const {getCwBycwid,updateMsg,insertMsg,getUserById,findUserByUserid,updateUserById,updateCw,getCwBase,getfidBycwid} = require('./handle')
const mongoControl = require('../dbc').mongoControl
var user = new mongoControl('animal', 'user')
var cw = new mongoControl('animal', 'cw')
const Msg = new mongoControl('animal', 'userMsg')
// 用户模块
// 登录
router.post('/login', urlencodedParser, (req, res) => {
  let {
    password,
    phoneNumber
  } = req.body.form
  password = jiemi(password)
  phoneNumber = jiemi(phoneNumber)
  const userJwt = createToken('user')
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
        data: date,
        token:userJwt
      })
    }
  })
})

router.get('/getCwBaseInfo', async (req, res) => {
  let {
    id
  } = req.query
  // const {info} = await verifyToken(req.headers.authorization)
  // console.log(info)
  // if(info!=='user'){
  //   res.cc('token携带错误')
  //   return 
  // }
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
        //trycatch在for循环里将捕获的错误不进行push，避免了id错误时，获取不到宠物信息所产生的错误
        try {
        let result = await new Promise((resolve, reject) => {
          cw.findById(cwArr[i], (err, date) => {
            if (err) {reject([{}])}
            else{
              resolve(date)
            }
          })
        })
        lastArr.push(result[0])
      } catch (error) {
        console.log('通过id获取宠物详细信息失败')
        // res.cc(error)
      }
    }
      res.send({
        code: 'ok',
        status: 200,
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
      status: 200,
      message: '获取用户数据成功！',
      data: date,
    })
  })
})
//获取用户消息数组
router.get('/getUserMsg',(req,res)=>{
  const id = req.query.id;
  Msg.find({myid:id,state:'pl'},(err,date)=>{
    if(err){
      res.cc(err)
    }else{
      res.send({
        status:200,
        data:date,
      })
    }
  })
})

// 注册
router.post('/register', urlencodedParser, (req, res) => {
  let {
    pass,
    phoneNumber,
    username,
    email
  } = req.body.form
  pass = jiemi(pass)
  phoneNumber = jiemi(phoneNumber)
  username = jiemi(username)
  email = jiemi(email)
  user.insert([{
    password: pass,
    phoneNumber,
    username,
    shoucang:[],
    friends:[],
    info: {},
    img:'http://localhost:3007/public/img/cw1.jpg',
    cw: [],
    email
  }], (err, date) => {
    if (err) {
      res.cc('发生错误')
      return
    } else {
      const userJwt = createToken('user')
      res.cookie('userToken', date.insertedIds[0].toString(), {
        expires: new Date(Date.now() + 9000000)
      })
      res.send({
        code: 'ok',
        status: 0,
        message: '获取用户数据成功！',
        data: date,
        token:userJwt
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
  fileInfo.url = `http://127.0.0.1:3007/${path}`
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
    let name = await findUserByUserid(id)
    let obj = {
    state:'pl', //消息类型
    content,  //留言内容
    fid:id,  //来自谁的id
    fname:name,  //来自谁的名字
    myid:fid //自己的id方便查找
  }
  let result = await insertMsg(obj)
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
    const name = await findUserByUserid(myid)
    const userobj = await getUserById(myid);
    const obj = {
      fname:name,
      content,
      fid:myid,
      myid:userid,
      state:'fq',
      img:userobj.img || ''
    }
    const result = await insertMsg(obj)
    if(result){
      res.send({
        status:200,
        data:'ok',
      })
    }
  } catch (error) {
    res.cc(error)
  }
})
//确认添加朋友
router.post('/sureAddFriend',urlencodedParser,async (req,res)=>{
  let {myid,userid,_id} = req.body.form;
  try {
    let myuserobj = await getUserById(myid);
    let otheruserobj = await getUserById(userid)
    if(myuserobj.friends!==undefined&&otheruserobj.friends!==undefined){
      let friends = myuserobj.friends;
      let newFriends = otheruserobj.friends;
      newFriends.push(myid)
      friends.push(userid);
      let r1 = await updateUserById(myid,{friends:friends})
      let r2 = await updateUserById(userid,{friends:newFriends})
      const r3 = await updateMsg(_id,{show:true})
      if(r1&&r2&&r3){
        res.send({
          status:200,
          data:'ok'
        })
      }else{
        res.cc('添加失败')
      }
    }else{
      res.cc('确认出错')
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
//获取好友请求列表
router.get('/getfriendrequest',(req,res)=>{
  let id = req.query.id;
  Msg.find({state:'fq',myid:id},(err,date)=>{
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
//发启好友转增请求
router.post('/findshare',urlencodedParser,async(req,res)=>{
  const {userid,myid,cwid} = req.body.form;
  try {
    const username = await findUserByUserid(myid) || ''
    const cw = await getCwBycwid(cwid)
    const obj = {
      state:'zz',
      myid:userid,
      fid:myid,
      fname:username,
      cwid:cwid,
      issure:false,
      cwName:cw.name
    }
    const result = await insertMsg(obj)
    if(result){
      res.send({
        status:200,
        data:'ok'
      })
    }
  } catch (error) {
    res.cc('发送好友转增请求失败')
  }
  
})
//获取转增请求
router.get('/getfriendshare',(req,res)=>{
  let id = req.query.id;
  Msg.find({state:'zz',myid:id},(err,date)=>{
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
//同意转增请求
router.post('/agreezz',urlencodedParser,async(req,res)=>{
  let {myid,userid,_id,cwid} = req.body.form;
  try {
    let myuserobj = await getUserById(myid);
    let otheruserobj = await getUserById(userid)
    if(myuserobj.cw!==undefined&&otheruserobj.cw!==undefined){
      let mycw = myuserobj.cw;
      let othercw = otheruserobj.cw;
      mycw.push(cwid)
      let newothercw = othercw.filter(item=>item!==cwid)
      let r1 = await updateUserById(myid,{cw:mycw})
      let r2 = await updateUserById(userid,{cw:newothercw})
      const r3 = await updateMsg(_id,{issure:true,yes:true})
      const r4 = await updateCw(cwid,{userid:myid})
      if(r1&&r2&&r3&&r4){
        res.send({
          status:200,
          data:'resolved'
        })
      }else{
        res.cc('添加失败')
      }
    }else{
      res.cc('确认出错')
    }
  } catch (error) {
    res.cc(error)
  }
})
//拒绝转增请求
router.post('/refusezz',urlencodedParser,async(req,res)=>{
  let {_id} = req.body.form;
  try {
    const r3 = await updateMsg(_id,{issure:true,yes:false})
    if(r3){
      res.send({
        status:200,
        data:'rejected'
      })
    }
  } catch (error) {
    res.cc(error)
  }
})
//收藏
router.post('/collect',urlencodedParser,async(req,res)=>{
  const {myid,cwid} = req.body.form;
  try {
    let myuserobj = await getUserById(myid);
    if(myuserobj.shoucang!==undefined){
      let arr = myuserobj.shoucang;
      arr.push(cwid)
      const r1 = await updateUserById(myid,{shoucang:arr})
      if(r1){
        res.send({
          status:200,
          data:'ok'
        })
      }else{
        res.cc('失败')
      }
    }else{
      res.cc('失败')
    }
  } catch (error) {
    res.cc('失败')
  }
})
//获取证书
router.post('/getcertificate',urlencodedParser,async(req,res)=>{
  const {userid} = req.body.form;
  try {
    const user = await getUserById(userid)
    const cwArr = user.cw
    let fArr = []
    for(let i=0;i<cwArr.length;i++){
      try {
        let fid = await getfidBycwid(cwArr[i])
        fArr.push(fid)
      } catch (error) {
        console.log('getfidBycwid失败')
      }
    }
    let result = []
    for(let i=0;i<fArr.length;i++){
      try {
        let base = await getCwBase(fArr[i])
        result.push(base)
      } catch (error) {
        console.log('getCwBase失败')
      }
    }
    res.send({
      status:200,
      data:result
    })
  } catch (error) {
    res.cc([])
  }
})

//找回密码通过邮箱更改密码
let userCode = 0
let timer
router.post('/findChangePass',urlencodedParser,(req,res)=>{
  const {code,email,newPass} = req.body;
  code = jiemi(code)
  email = jiemi(email)
  newPass = jiemi(newPass)

  if(code!==userCode){
    res.cc('验证码过期')
    return 
  }
  user.update({email},{password:newPass},(err,data)=>{
    if(err){
      res.cc('change false')
    }else{
      res.send({
        status:200,
        data:data
      })
      clearInterval(timer)
    }
  })
})

router.post("/sendEmail",urlencodedParser, async (req, res)=> {
  try {
    var code = '';
    for(var i=0;i<6;i++){
        code += parseInt(Math.random()*10);
    }
    timer = setInterval(()=>{
      console.log('userCode',userCode)
      if(userCode!==0){
        userCode = 0
        // console.log('====')
      }
    },600000)
    userCode = code
    var email = req.body.email;
    var subject = "这是验证码请查收";//标题
    var text = undefined;
    var html = `<h2>你好</h2><p>这是你的验证码: ${code}</p>十分钟内有效</p>`;

    mailer.emailTo(email, subject, text, html, function (data) {
      console.log('data',data)
      res.send({
        status:data.httpCode,
        data:data
      })
      
    })
  } catch (error) {
    res.cc(error)
  }
  
})

//更改密码
router.post('/changepass',urlencodedParser,async(req,res)=>{
  try {
    const {id,oldpass,newpass} = JSON.parse(jiemi(req.body.form));
    const obj = {password:newpass}
    const user = await getUserById(id)
    if(user.password!==oldpass){
      res.send({
        status:403,
        data:'pass not ture'
      })
      return
    }
    const result = await updateUserById(id,obj)
  if(result){
    res.send({
      status:200,
      data:'ok'
    })
  }
  else{
    res.cc('change false')
  }
  } catch (error) {
    res.cc(error)
  }
  
})
module.exports = router