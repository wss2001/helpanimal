const mongoControl = require('../dbc').mongoControl
// 领养者
const moment = require('moment')
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')
var comment = new mongoControl('animal', 'comment')
var news = new mongoControl('animal', 'news')
const admin = new mongoControl('animal', 'admin')
const Msg = new mongoControl('animal', 'userMsg')
const {RandomNumBoth} = require('../utils/index')

/**
 * @description 通过用户id获取用户宠物数组
 * @param {id} userid 
 * @returns cw数组
 */
exports.getUserCwArr = async (userid) => {
  if(userid==''){
    return []
  }
  let result = await new Promise((resolve, reject) => {
    user.findById(userid, (err, date) => {
      if (err) reject(err)
      resolve(date[0].cw)
    })
  })
  return result
}
/**
 * @description 通过宠物id获取宠物img数组
 * @param {*} cwid 
 * @returns 
 */
exports.getCwImgArr = async (cwid) => {
  if(cwid==''){
    return []
  }
  let result = await new Promise((resolve, reject) => {
    cw.findById(cwid, (err, date) => {
      if (err) reject(err)
      resolve(date[0].imgArr)
    })
  })
  return result
}
/**
 * @description 通过基地id获取用户宠物数组
 * @param {id} baseid 
 * @returns cw数组
 */
exports.getBaseCwArr = async (baseid) => {
  let result = await new Promise((resolve, reject) => {
    cwBase.findById(baseid, (err, date) => {
      if (err) reject(err)
      if(date[0].baseCw){
        resolve(date[0].baseCw)
      }else{
        reject('通过基地id获取用户宠物数组失败')
      }
      
    })
  })
  return result
}
/**
 * @description 通过基地id获取基地
 * @param {id} baseid 
 * @returns 基地集合
 */
exports.getBaseById = async (baseid) => {
  let result = await new Promise((resolve, reject) => {
    cwBase.findById(baseid, (err, date) => {
      if (err){ reject(false)}else{
        resolve(date[0])
      }
      
    })
  })
  return result
}

/**
 * @description 根据宠物id删除宠物
 * @param {id} cwid 
 * @returns 
 */
exports.deleteCw = async (cwid) => {
  try {
    let result = await new Promise((resolve, reject) => {
      cw.deleteById(cwid, (err, date) => {
        if (err) {reject(false)}
        else{
          resolve(date)
        }
        
      })
    })
    return result
  } catch (error) {
    console.log('根据宠物id删除宠物失败')
    return false
  }
  
}

/**
 * @description 通过宠物id获取用户id
 * @param {id} cwid 
 * @returns userid
 */
exports.getUseridBycw = async (cwid) => {
  try {
    let result = await new Promise((resolve, reject) => {
      cw.findById(cwid, (err, date) => {
        if (err) {
          reject('通过宠物id获取用户id失败')
        }
        if(date[0]){
          resolve(date[0].userid)
        }else{
          resolve('')
        }
        
      })
    })
    return result
  } catch (error) {
    console.log(error)
    return '通过宠物id获取用户id失败'
  }
  
}

/**通过用户id更新用户宠物数组
 * @description
 * @param {id} userid 
 * @param {*cw数组} arr 
 * @returns 
 */
exports.updateusercwarr = async (userid, arr) => {
  try {
    let result = await new Promise((resolve, reject) => {
      user.updateById(userid,{cw:arr} ,(err, date) => {
        if (err) {
          reject(err)
        }
        resolve(date[0].userid)
      })
    })
    return result
  } catch (error) {
    console.log(error)
    return '通过用户id更新用户宠物数组失败'
  }
  
}
/**
 * @description 通过基地id更新基地宠物数组
 * @param {baseid} baseid 
 * @param {*cw数组['id','id']} arr 
 * @returns 
 */
exports.updatebasecwarr = async (baseid, arr) => {
  try {
    let result = await new Promise((resolve, reject) => {
      cwBase.updateById(baseid,{baseCw:arr} ,(err, date) => {
        if (err) {
          reject(err)
        }
        resolve(date)
      })
    })
    return result
  } catch (error) {
    console.log('通过基地id更新基地宠物数组失败')
    return '通过基地id更新基地宠物数组失败'
  }
  
}

/**
 * @description 新增宠物
 * @param {cwobj} obj 
 * @returns cwid
 */
exports.addcw = async (obj) => {
  try {
    let result = await new Promise((resolve, reject) => {
      cw.insert([obj], (err, date) => {
        if (err) {
          reject(err)
        }
        resolve(date.insertedIds['0'].toString())
      })
    })
    return result
  } catch (error) {
    console.log('新增宠物失败')
    return '新增宠物失败'
  }
  
}
/**
 * @description 通过宠物id获取基地id
 * @param {*} cwid 
 * @returns 
 */
exports.getfidBycwid = async (cwid)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      cw.findById(cwid,(err,date)=>{
        if(err){
          reject(err)
        }else{
          resolve(date[0].fid)
        }
      })
    })
    return result
  } catch (error) {
    console.log('通过宠物id获取基地id失败')
    return false
  }
}
/**
 * @description 通过基地id获取任意一个宠物id
 * @param {基地id} fid 
 * @returns 
 */
exports.getbrotheridByfid = async (fid,cwid)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      cwBase.findById(fid,(err,date)=>{
        if(err){
          reject(err)
        }else{
          let cwArrLength
          if(date[0]){
            cwArrLength = date[0].baseCw.length
          }else{
            cwArrLength = 0
          }
          if(cwArrLength==0){
            resolve('')
          }else if(cwArrLength ==1){
            resolve(date[0].baseCw[0])
          }
          else{
            let othercwidnum = RandomNumBoth(0,cwArrLength-1)
            let othercwid = date[0].baseCw[othercwidnum]
            while(othercwid==cwid){
              othercwidnum = RandomNumBoth(0,cwArrLength-1)
              othercwid = date[0].baseCw[othercwidnum]
            }
          resolve(othercwid)
          }
          
        }
      })
    })
    return result
  } catch (error) {
    console.log('通过基地id获取任意一个宠物id失败')
    return '627e4976f733de5b3f6cafc1'
  }
}
/**
 * @description 通过cwid获取宠物详细信息
 * @param {*} cwid 
 * @returns 
 */
exports.getCwBycwid = async (cwid)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      cw.findById(cwid,(err,date)=>{
        if(err){
          reject(err)
        }else{
          resolve(date[0])
        }
      })
    })
    return result
  } catch (error) {
    console.log('通过宠物id获取宠物数据失败')
    return false
  }
}
/**
 * @description 根据baseid获取评论内容
 * @param {*} baseid 
 * @returns 
 */
exports.getCommentBybaseid = async (baseid)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      comment.find({fid:baseid},(err,date)=>{
        if(err){
          reject(err)
        }else{
          resolve(date)
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据baseid获取评论内容失败')
    return  '根据baseid获取评论内容失败'
  }
}
/**
 * @description 根据用户id获取用户名
 * @param {*} userid 
 * @returns 
 */
exports.findUserByUserid = async (userid)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      user.findById(userid,(err,date)=>{
        if(err){
          reject(err)
        }else{
          if(date.length==0 || date[0].username==undefined){
            resolve('')
          }else{
            resolve(date[0].username)
          }
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据用户id获取用户名失败')
    return  ''
  }
}
/**
 * @description 获取新闻
 * @returns news数组
 */
exports.getNews = async ()=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      news.find({},(err,date)=>{
        if(err){
          reject(err)
        }else{
          resolve(date)
        }
      })
    })
    return result
  } catch (error) {
    console.log('获取新闻失败')
    return  undefined
  }
}
/**
 * 根据id来更换用户内容
 * @param {*} id 
 * @param {*} type 
 * @param {*} obj 
 * @returns boolean
 */
exports.updateUserById = async (id,obj)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      user.updateById(id,obj,(err,date)=>{
        if(err){
          reject(false)
        }else{
          resolve(true)
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据id来更换用户内容失败')
    return  false
  }
}
/**
 * @description 根据用户id来获取消息数组
 * @param {*} id 
 * @returns 消息数组[]
 */
exports.getUserMsgById = async (id)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      user.findById(id,(err,date)=>{
        if(err){
          reject(err)
        }else{
          if(date[0]&&date[0].msg){
            resolve(date[0].msg)
          }else{
            reject([])
          }
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据用户id获取用户名失败')
    return []
  }
}
/**
 * @description 根据信息来插入改变消息数组
 * @param {*} id 
 * @returns 
 */
// exports.updateMsgById = async (arr,obj,id)=>{
//   try {
//     let result = await new Promise((resolve,reject)=>{
//       arr.push(obj)
//       user.updateById(id,{msg:arr},(err,date)=>{
//         if(err){
//           reject(false)
//         }else{
//           resolve(true)
//         }
//       })
//     })
//     return result
//   } catch (error) {
//     console.log('根据信息来插入改变消息数组失败')
//     return  false
//   }
// }
/**
 * 插入用户消息数组消息
 * @param {*} obj 
 * @returns 
 */
exports.insertMsg = async (obj)=>{
  try {
    const result = new Promise((resolve,reject)=>{
      Msg.insert([{...obj,date: moment().format('YYYY-MM-DD')}],(err,date)=>{
        if(err){
          reject(false)
        }else{
          resolve(true)
        }
      })
    })
    return result
  } catch (error) {
    console.log('')
    return false
  }
}
/**
 * @description 根据id修改消息内容
 * @param {*} id 
 * @param {*} obj 
 * @returns 
 */
exports.updateMsg = async (id,obj)=>{
  try {
    const result = new Promise((resolve,reject)=>{
      Msg.updateById(id,obj,(err,date)=>{
        if(err){
          reject(false)
        }else{
          resolve(true)
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据id修改消息内容失败')
    return false
  }
}
/**
 * @description 根据id修改基地内容
 * @param {*} id 
 * @param {*} obj 
 * @returns 
 */
exports.updateCwBase = async (id,obj)=>{
  try {
    const result = new Promise((resolve,reject)=>{
      cwBase.updateById(id,obj,(err,date)=>{
        if(err){
          reject(false)
        }else{
          resolve(true)
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据id修改消息内容失败')
    return false
  }
}
/**
 * 根据id来修改cw集合
 * @param {*} id 
 * @param {*} obj 
 * @returns 
 */
exports.updateCw = async (id,obj)=>{
  try {
    const result = new Promise((resolve,reject)=>{
      cw.updateById(id,obj,(err,date)=>{
        if(err){
          reject(false)
        }else{
          resolve(true)
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据id来修改cw集合失败')
    return false
  }
}

/**
 * @description 根据用户id获取其集合
 * @param {*} id 
 * @returns User
 */
exports.getUserById = async (id)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      user.findById(id,(err,date)=>{
        if(err){
          reject(err)
        }else{
          resolve(date[0])
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据用户id获取其集合失败')
    return  []
  }
}
/**
 * 根据id删除admin中的消息
 * @param {*} id 
 * @returns 
 */
exports.deleteMsgByID = async (id)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      admin.deleteById(id,(err,date)=>{
        if(err){
          reject(false)
        }else{
          resolve(true)
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据id删除admin中的消息失败')
    return  false
  }
}
/**
 * 根据id来查找admin中的注册消息
 * @param {*} id 
 * @returns 
 */
exports.findMsgById = async (id)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      admin.findById(id,(err,date)=>{
        if(err){
          reject(false)
        }else{
          resolve(date[0])
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据id来查找admin中的注册消息失败')
    return  false
  }
}
/**
 * @description 根据id获取基地集合
 * @param {*} id 
 * @returns 
 */
exports.getCwBase = async (id)=>{
  try {
    let result = await new Promise((resolve,reject)=>{
      cwBase.findById(id,(err,date)=>{
        if(err){
          reject({})
        }else{
          resolve(date[0])
        }
      })
    })
    return result
  } catch (error) {
    console.log('通过宠物id获取基地id失败')
    return false
  }
}
