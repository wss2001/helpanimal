const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')
var comment = new mongoControl('animal', 'comment')
const {RandomNumBoth} = require('../utils/index')

/**
 * @description通过用户id获取用户宠物数组
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
      resolve(date)
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
      resolve(date[0].baseCw)
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
        if (err) reject(err)
        resolve(date)
      })
    })
    return result
  } catch (error) {
    console.log(error)
    return '根据宠物id删除宠物失败'
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
        resolve(date[0].userid)
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
    console.log(通过基地id更新基地宠物数组失败)
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
    return  '通过宠物id获取基地id失败'
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
          }else{
            let othercwidnum = RandomNumBoth(0,cwArrLength-1)
            let othercwid = date[0].baseCw[othercwidnum]
            while(othercwid==cwid){
              othercwidnum = RandomNumBoth(0,cwArrLength-1)
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
    console.log('通过宠物id获取基地id失败')
    return  '通过宠物id获取基地id失败'
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
            resolve(undefined)
          }else{
            resolve(date[0].username)
          }
        }
      })
    })
    return result
  } catch (error) {
    console.log('根据用户id获取用户名失败')
    return  undefined
  }
}