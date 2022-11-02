const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const {
  addDate,
  calculateDiffTime
} = require('../utils/index')
const {
  getfidBycwid,
  getbrotheridByfid,
  getCwBycwid,updateCw
} = require('../router/handle')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})

const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
router.get('/getcw', async (req, res) => {
  let {
    id
  } = req.query
  try {
    let result = await getCwBycwid(id)
    res.send({
      code:'ok',
    status:200,
    data:result
    })
  } catch (error) {
    res.cc(error)
  }
  
})
router.post('/addfood', urlencodedParser, async (req, res) => {
  let newfood = req.body.form.food
  let _id = req.body.form.id
  let result
  try {
    result = await new Promise((resolve, reject) => {
      cw.findById(_id, (err, date) => {
        if (err) reject(err)
        resolve(date)
      })
    })
  } catch (error) {
    console.log(error)
    res.cc(error)
  }
  let alsoFood = result[0].alsoFood
  let lastfood = addDate(alsoFood, newfood)
    let date = new Date().getTime()
    let foodTime = new Date(alsoFood).getTime()
    console.log(date,foodTime)
    let handleFood = calculateDiffTime(date,foodTime)
    if(date>foodTime){
      handleFood = '0天'
    }
    console.log(handleFood,lastfood,alsoFood)
    
  cw.updateById(_id, {
    alsoFood: lastfood,
    alsoFoodtian:handleFood,
  }, (err, date) => {
    if (err) {
      res.cc(err)
    } else {
      res.send({
        code: 'ok',
        status: 0,
        data: lastfood,
        message: '添加食物成功'
      })
    }
  })
})
router.get('/getbrother',async (req,res)=>{
  let cwid = req.query.id;
  try {
    let fid = await getfidBycwid(cwid)
  let brothercwid = await getbrotheridByfid(fid,cwid)
  let result = await getCwBycwid(brothercwid)
  res.send({
    code:'ok',
    status:200,
    data:result
  })
  } catch (error) {
    res.cc('没找到')
  }
})
router.get('/updatefood',async(req,res)=>{
  const cwid = req.query.id;
  try {
    const cw = await getCwBycwid(cwid)
    const alsoFood = cw.alsoFood
    const date = new Date().getTime()
    const foodTime = new Date(alsoFood).getTime()
    let handleFood
    if(date>foodTime){
      handleFood = 0
    }
    else{
      handleFood = calculateDiffTime(date,foodTime)
    }
    const r1 = await updateCw(cwid,{alsoFoodtian:handleFood})
    if(r1){
      res.send({
        status:200,
        data:'update cw food ok'
      })
    }
  } catch (error) {
    res.cc('更新宠物天数失败')
  }
})
//这里得这么导出
module.exports = router