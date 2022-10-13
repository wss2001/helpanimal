const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')

/**
 * @description通过用户id获取用户宠物数组
 * @param {id} userid 
 * @returns cw数组
 */
exports.getUserCwArr = async (userid) => {
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
  let result = await new Promise((resolve, reject) => {
    cw.deleteById(cwid, (err, date) => {
      if (err) reject(err)
      resolve(date)
    })
  })
  return result
}

/**
 * @description 通过宠物id获取用户id
 * @param {id} cwid 
 * @returns userid
 */
exports.getUseridBycw = async (cwid) => {
  let result = await new Promise((resolve, reject) => {
    cw.findById(id, (err, date) => {
      if (err) {
        reject(err)
      }
      resolve(date[0].userid)
    })
  })
  return result
}

/**通过用户id更新用户宠物数组
 * @description
 * @param {id} userid 
 * @param {*cw数组} arr 
 * @returns 
 */
exports.updateusercwarr = async (userid, arr) => {
  let result = await new Promise((resolve, reject) => {
    user.updateById(userid,{cw:arr} ,(err, date) => {
      if (err) {
        reject(err)
      }
      resolve(date[0].userid)
    })
  })
  return result
}
/**
 * @description 通过基地id更新基地宠物数组
 * @param {baseid} baseid 
 * @param {*cw数组['id','id']} arr 
 * @returns 
 */
exports.updatebasecwarr = async (baseid, arr) => {
  let result = await new Promise((resolve, reject) => {
    cwBase.updateById(baseid,{baseCw:arr} ,(err, date) => {
      if (err) {
        reject(err)
      }
      resolve(date)
    })
  })
  return result
}

/**
 * @description新增宠物
 * @param {cwobj} obj 
 * @returns cwid
 */
exports.addcw = async (obj) => {
  let result = await new Promise((resolve, reject) => {
    cw.insert([obj], (err, date) => {
      if (err) {
        reject(err)
      }
      resolve(date.insertedIds['0'].toString())
    })
  })
  return result
}