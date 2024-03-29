// es6封装
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectId = mongodb.ObjectId
var url = "mongodb://localhost:27017"
class mongoControl {
  constructor(dbName, collectionName) {
    this.dbName = dbName
    this.collectionName = collectionName
  }
  // 搜索
  find(whereStr, callback) {
    MongoClient.connect(url, (error, db) => {
      if (error) {
        callback(error)
        return
      }
      var dbo = db.db(this.dbName)
      dbo.collection(this.collectionName).find(whereStr).toArray((err, result) => {
        callback(err, result)
        db.close()
      })
    })
  }
  // 排序
  sort(type, callback) {
    MongoClient.connect(url, (error, db) => {
      if (error) {
        callback(error)
        return
      }
      var dbo = db.db(this.dbName)
      var mysort = { type:type };
      dbo.collection(this.collectionName).find().sort(mysort).toArray((err, result) => {
        callback(err, result)
        db.close()
      })
    })
  }
  // 插入
  insert(docs, callback) {
    MongoClient.connect(url, (error, db) => {
      if (error) throw error
      var dbo = db.db(this.dbName)
      dbo.collection(this.collectionName).insertMany(docs, (error, result) => {
        callback(error, result)
        db.close()
      })
    })
  }
  // 更改
  update(whereStr, newData, callback) {
    MongoClient.connect(url, (error, db) => {
      if (error) throw error
      var dbo = db.db(this.dbName)
      dbo.collection(this.collectionName).updateMany(whereStr, {
        $set: newData
      }, (error, result) => {
        callback(error, result)
        db.close()
      })
    })
  }
  // 删除
  delete(whereStr, callback) {
    MongoClient.connect(url, (error, db) => {
      if (error) throw error
      var dbo = db.db(this.dbName)
      dbo.collection(this.collectionName).deleteMany(whereStr, (error, result) => {
        callback(error, result)
        db.close()
      })
    })
  }
  // 通过_id来删除
  deleteById(_id, callback) {
    var whereStr = {
      _id: ObjectId(_id)
    }
    this.delete(whereStr, callback)
  }
  // 通过_id来查找
  findById(_id, callback) {
    var whereStr = {
      _id: ObjectId(_id)
    }
    this.find(whereStr, callback)
  }
  //  通过_id来更新
  updateById(_id, newData, callback) {
    var whereStr = {
      _id: ObjectId(_id)
    }
    this.update(whereStr, newData, callback)
  }
}

exports.mongoControl = mongoControl