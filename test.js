// const {
//   getUserCwArr
// } = require('./router/handle')

// const test = async ()=>{
//   let result = await getUserCwArr('6281f55599612244d8d3f77d')
//   console.log(result)
// }
// test()
const moment = require('moment')
const url=require('url')

const mongoControl = require('./dbc').mongoControl
// // 领养者
var comment = new mongoControl('animal', 'comment')
var news = new mongoControl('animal', 'news')
var msg = new mongoControl('animal', 'userMsg')
// msg.delete({state:'tw'},()=>{})
let s = '%E5%B0%8F%E5%88%98'
let ss = 'nickname=%E5%B0%8F%E5%88%98&gender=%E7%94%B7&email=12345%40qq.com&password=xiaoliu'
// s.replace(/%/g,'%25')
var str  = decodeURIComponent(s)

console.log(str)
// const updateUserById = async (id,obj)=>{
//   try {
//     let result = await new Promise((resolve,reject)=>{
//       comment.updateById(id,obj,(err,date)=>{
//         if(err){
//           reject(false)
//         }else{
//           resolve(true)
//         }
//       })
//     })
//     return result
//   } catch (error) {
//     console.log('根据id来更换用户内容失败')
//     return  false
//   }
// }
// const datet = {datete:[123]}
// updateUserById('62931c3d1fa40491b695795b',datet)
// admin.insert([{phoneNumber:123,pass:'123'}],()=>{console.log('p')})
// let arr = [
//   '627cb6800e9ad24c2b1f8bca',
//   '629453ad462514287a542827',
//   '629d9793f85439c6a992c577',
//   '629eec1f2edf317a954dc0d6',
//   '629eef10ca4c8aaa9e3a7b51',
//   '6346b9356e32045d07735642s'
// ]
// cwBase.updateById('627cb6800e9ad24c2b1f8bc8',{baseCw:arr},(err,date)=>{
//   if(err){
//     console.log(err)
//   }else{
//     console.log('ok',date)
//   }
// })
// comment.find({},(err,date)=>{
//   console.log(date)
// })
// comment.sort(1,(err,date)=>{
//   console.log(date)
// })

