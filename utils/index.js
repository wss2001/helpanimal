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
      console.log(`相差${year}年${month}月${day}天${hour}小时${minute}分${second}秒`);
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
  d.setDate(d.getDate() + days);
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