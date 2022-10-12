const mongoControl = require('../dbc').mongoControl
// 领养者
var cwBase = new mongoControl('animal', 'cwBase')
var cw = new mongoControl('animal', 'cw')
var user = new mongoControl('animal', 'user')

exports.getUserCwArr = async (userid) => {
  let result = await new Promise((resolve, reject) => {
    user.findById(userid, (err, date) => {
      if (err) reject(err)
      resolve(date)
    })
  })
  return result
}

exports.getBaseCwArr = async (baseid) => {
  let result = await new Promise((resolve, reject) => {
    cwBase.findById(baseid, (err, date) => {
      if (err) reject(err)
      resolve(date)
    })
  })
  return result
}

exports.deleteCw = async (cwid) => {
  let result = await new Promise((resolve, reject) => {
    cw.deleteById(cwid, (err, date) => {
      if (err) reject(err)
      resolve(date)
    })
  })
  return result
}

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

exports.updatebasecwarr = async (baseid, arr) => {
  let result = await new Promise((resolve, reject) => {
    cwBase.updateById(baseid,{baseCw:arr} ,(err, date) => {
      if (err) {
        reject(err)
      }
      resolve(date[0].userid)
    })
  })
  return result
}
//新增宠物
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