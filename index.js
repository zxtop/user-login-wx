const express = require('express');
const bodyParse = require('body-parser');
const request = require('request');
const { response } = require('express');
const app = express();
app.use(bodyParse.json());

const wx={
    appid:'wx7f2bee2f8ec48b81',  //开发者的AppID
    secret:'0a252987649a5ac0f86e5ec0957e41a7'  //开发者的appsecrect
}

var db={  //模拟数据库
    session:{}, //保存openid和session_key的会话信息
    user:{}// 保存用户记录，如用户名、积分等数据
}

 // 提供给小程序的登录接口，接收code参数，响应token

 app.post('/login',(req,res)=>{
     console.log('login code'+req.body.code);
     var url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+wx.appid+
     '&secret='+wx.secret+'&js_code='+req.body.code+'&grant_type=authorization_code';

     request(url,(err,response,body)=>{
         console.log('session:'+body)
        //  if(session.openid){
             var session = JSON.parse(body);
             var token = 'token_'+new Date().getTime();
             db.session[token] = session
             // 保存用户记录，设置用户初始积分为100
             if(!db.user[session.openid]){
                 db.user[session.openid]={credit:100}
             }
        //  }

         res.json({token:token})
     })
 })

 app.get('/credit',(req,res)=>{
     var session =db.session[req.query.token];
     if(session&&db.user[session.openid]){
         res.json({credit:db.user[session.openid].credit})
     }else{
         res.json({err:'用户不存在，或未登陆'})
     }
 })

 //验证token是否过期
 app.get('/checklogin',(req,res)=>{
     var session = db.session[req.query.token];
     console.log('checklogin:',session);
     
     // 将用户是否已经登录的布尔值返回给客户端
     res.json({is_login:session!==undefined})

 })

 app.listen(3000,()=>{
     console.log('serve running at http:127.0.0.1:3000')
 })

 