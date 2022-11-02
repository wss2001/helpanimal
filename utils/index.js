const NodeRSA = require("node-rsa");
let PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgHhRji4xQbxS0KwXJm8Ud/orrwxadH/VR7/uLlJ6ayNGsAqm1+oh
Aobgzqj6yDWdAaK1GwEpO+ACTBUEhMYiMuugxEO79iYtlEXKCHbqiR0ua7w8oZPQ
p6i+pIcO/OgDJTEIA38spnqmPvfnz4UKFQSmt3SFLx8rjzDhyYw+T3P/AgMBAAEC
gYASbbtvS9AbvjuEAE+8t8/gm4xGQhyR7+L7fMnPjDyYvJz+JKvxinjOm+RLcY30
2EWF3GN0fBJVr0Rj+7sydc6CnITZ5cM6zewkvtvQwDf74D6PRRr8vAtKpHb2UKrY
Zk5KHg9WH8HC1Fb7QUBeY00XTKbAs7N9pF+15Edc88bpkQJBAOxlTN60+rproZTp
AND5bn+32Rp2YvdBy8dJlRd7WSAn9dyK6DStW8Vu1lVfuBcJxuiCmw3Np9YBFBlp
YQ0k5D0CQQCCS+2q4fpNL5y8LEYaJ5OKlEaao4S6Yq7p82H8X4KDif9UpZ+cn74q
+xazpr5RrHTWE3T4+4WEckGcBPAzKLDrAkEAiu7aZ8Vr2mZpd7AdR7RhCfUORqwv
a+wijMSlOEDJV8nEiNKmuFbuqbGDjHeOJRQc8AfagxlMO800d97kKCp3bQJAOqr/
j9MChiCrHRt+USaCy4IqLFT2XYozognBlAZZWOsY+b89mCNhWC8IsMmiplnVndLS
940hOFrN6fdbRF3NEwJBAMjjojzOi2eqtMjFerB10/ers03mCZSuXJhGITi5eUCg
tACGxjLPBnKWxdyIN11XxL4xSDR9KLRzmFBb2wzkQ54=
-----END RSA PRIVATE KEY-----`
exports.jiemi = function(data){
  const privateKey = new NodeRSA(PRIVATE_KEY)
	privateKey.setOptions({ encryptionScheme: 'pkcs1' }) // node-rsa 跟jsecrypt 协议不一样
  return privateKey.decrypt(data, 'utf8')
}
exports.jiami = function(data){
  const nodersa = new NodeRSA(PRIVATE_KEY);
  const decrypted = nodersa.encryptPrivate(data, 'base64',"utf8");
  return decrypted
}
/**
 * @description 通过前后俩个时间戳获取其中相差几天
 * @param {*时间戳} startTime 
 * @param {*时间戳} endTime 
 * @returns 
 */
exports.calculateDiffTime = function(startTime,endTime){
  // let startTime = '1629100469000' //2021-08-16 17:51
  //     let endTime = '1876262719000' //2032-08-16 17:51
      let runTime = parseInt((endTime - startTime) / 1000);
      var year = Math.floor(runTime / 86400 / 365);
      runTime = runTime % (86400 * 365);
      var month = Math.floor(runTime / 86400 / 30);
      runTime = runTime % (86400 * 30);
      var day = Math.floor(runTime / 86400);
      runTime = runTime % 86400;
      var hour = Math.floor(runTime / 3600);
      runTime = runTime % 3600;
      var minute = Math.floor(runTime / 60);
      runTime = runTime % 60;
      var second = runTime;
      // console.log(`相差${year}年${month}月${day}天${hour}小时${minute}分${second}秒`);
      return `${month}月${day}天`
}
/**
 * 通过一个时间，和天数看俩个相加为多少
 * @param {yyyy-mm-dd} date 
 * @param {*string} days 
 * @returns 返回相加后的时间yyyy-mm-dd格式
 */
exports.addDate = function(date, days) {
  var d = new Date(date);
  d.setDate(d.getDate() + parseInt(days));
  var m = d.getMonth() + 1;
  var da = d.getDate();
  if (m < 10) {
    m = '0' + m;
  }
  if (da < 10) {
    da = '0' + da;
  }
  return d.getFullYear() + '-' + m + '-' + da;
}
//获取随机数
exports.RandomNumBoth = function (Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  var num = Min + Math.round(Rand * Range); //四舍五入
  return num;
}