var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const smtp = 'smtp.qq.com' //主机  查看发送邮件的邮箱开放的host
const port = '465' //SMTP 端口 查看发送邮件的邮箱开放的port
const mailFrom = '2683454510@qq.com' //发送邮件的邮箱
const mailPwd = 'qcuannxsprxldhid'; //授权码
function emailTo(email, subject, text, html, callback) {
  // 开启一个 SMTP 连接池
  var transporter = nodemailer.createTransport(smtpTransport({
    host: smtp, // 主机  查看发送邮件的邮箱开放的host
    secure: true, // 使用 SSL
    secureConnection: true, // 使用 SSL
    port: port, // SMTP 端口 查看发送邮件的邮箱开放的port
    auth: {
      user: mailFrom, //发送邮件的邮箱
      pass: mailPwd //授权码,通过QQ获取    发送邮件的邮箱的密钥

    }
  }));
  var mailOptions = {
    from: mailFrom, // 发送者发送邮件的邮箱，与上面 user 相同
    to: email, // 接受者,可以同时发送多个,以逗号隔开
    subject: subject, // 标题
    html: html //邮件内容，可以为html
  };
  mailOptions.text = text; // 文本
  var result = {
    httpCode: 200,
    message: '您已成功发送邮箱!',
    data: {},
  }
  try {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        result.httpCode = 500;
        result.message = err;
        callback(result);
        return;
      }
      callback(result);
    });
  } catch (err) {
    result.httpCode = 0;
    result.message = err;
    callback(result);
  }
  transporter.close(); // 如果没用，关闭连接池

}

module.exports = {
  emailTo
};