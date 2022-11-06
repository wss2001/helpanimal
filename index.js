const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
// 导入并配置 cors 中间件
const cors = require('cors')
app.use(cors())

var multer = require('multer')
var fs = require('fs')
const urlencodedParser = bodyParser.urlencoded({extended:false})
app.use(bodyParser.json())
app.all("*", function (req, res, next) { //配置预检请求
  // console.log(req.method);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-type");
  res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  // res.header("Access-Control-Max-Age", 1728000); //预请求缓存20天
  next();
});
app.use('/public', express.static(__dirname + '/public'))
app.use((req,res,next)=>{
  res.cc = function (err,status = 1) {
    res.send({
      status,
      data:err instanceof Error?err.message:err
    })
  }
  next()
})

const cwBaseRouter = require('./router/cwbase')
const cwRouter = require('./router/cw')
const userRouter = require('./router/user')
const adminRouter = require('./router/admin')
const commentRouter = require('./router/comment')
const payRouter = require('./router/pay')
app.use('/cwbase', cwBaseRouter)
app.use('/cw',cwRouter)
app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.use('/comment',commentRouter)
app.use('/pay',payRouter)


// 启动服务器
app.listen(3007, () => {
  console.log('api server running at http://127.0.0.1:3007')
})