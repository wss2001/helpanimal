var express = require('express')
var router = express.Router()
const path = require('path')
const alipaySdk = require('../utils/alipayUtil')
const bodyParser = require('body-parser')
const AlipayFormData = require('alipay-sdk/lib/form').default
const cors = require('cors') //解决跨域请求问题
router.use(cors())
const {
  getCwBycwid,
  updateCw,
  getUserById,
  updateUserById,
  insertMsg,
  getfidBycwid
} = require('./handle')
const {
  addDate
} = require('../utils/index')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
// 调用支付接口打开支付沙箱
router.post('/api/payment', urlencodedParser, async (req, res) => { //支付宝数据封装
  const {
    food
  } = req.body.form;
  const form = req.body.form;
  console.log(form)
  // 对接支付宝
  const formData = new AlipayFormData();
  formData.setMethod('get');
  // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
  // formData.addField('notifyUrl', 'http://127.0.0.1:3007/pay/getpay');
  // 当支付完成后，当前页面跳转的地址
  formData.addField('returnUrl', `http://127.0.0.1:3007/pay/getpay?k=${JSON.stringify(form)}`); //回调地址
  // 商单信息
  formData.addField('bizContent', {
    out_trade_no: "21245956656" + Math.random(1, 400) + "1128",
    product_code: "FAST_INSTANT_TRADE_PAY",
    subject: "捐赠金",
    body: "详情",
    // timeout_express: "90m", 超时
    total_amount: food,
  });
  let result = alipaySdk.exec(
    'alipay.trade.page.pay', {}, {
      formData: formData
    }
  );
  result.then((resp) => {
    res.send({
      success: 'true',
      status: 200,
      data: resp,
    });
  });
});
// 获取支付后的结果
router.get('/getpay', async (req, res) => {
  const {
    state,
    food,
    userid,
    cwid
  } = JSON.parse(req.query.k);
  try {
    const cw = await getCwBycwid(cwid)
    const newFood = addDate(cw.alsoFood, food)
    const fid = await getfidBycwid(cwid)
    if (state == 'tw') {
      const result = await updateCw(cwid, {
        alsoFood: newFood
      })
      //给后台添加数据日志
      const obj = {
        state:'tw',
        userid,
        cwid,
        food,
        baseid:fid
      }
      const r2 = await insertMsg(obj)
      if (result && r2) {
        res.sendFile(path.resolve('./public/gohome.html'))
      }
    }
    if (state == 'sy') {
      const user = await getUserById(userid);
      const cwArr = user.cwArr
      cwArr.push(cwid)
      const r1 = await updateUserById(userid, {
        cwArr: cwArr
      })
      const obj = {
        state:'sy',
        userid,
        cwid,
        food,
        baseid:fid
      }
      const r2 = await insertMsg(obj)
      if (r1&&r2) {
        res.sendFile(path.resolve('./public/gohome.html'))
      }
    }

  } catch (error) {
    res.cc('出错了')
  }
})
module.exports = router;