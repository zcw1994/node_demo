
const fs = require('fs');
const path = require('path');
const qs = require('querystring');

//引入mongodb模块

const MongoClient = require('mongodb').MongoClient;

//定义连接 数据库的 url地址

const url  = 'mongodb://localhost:27017';

module.exports = {

  login(req,res){
    var data = fs.readFileSync(path.resolve(__dirname,'../views/login.html'));
    res.writeHead(200,{
      'Content-Type':'text/html; charset=utf-8'
    });
    res.write(data);
    res.end();
  },

  register(req,res){
    var data = fs.readFileSync(path.resolve(__dirname,'../views/register.html'));
    res.writeHead(200,{
      'Content-Type':'text/html; charset=utf-8'
    });
    res.write(data);
    res.end();

  },

  home(req,res){
    res.writeHead(200,{
      'Content-Type':'text/html; charset=utf-8'
    });
    res.write('首页');
    res.end();
  },



  //注册请求
  registerFn(req,res){
    var rawData = ''
    req.on('data',(chunk) =>{
      rawData+=chunk;
    });

    req.on('end',() =>{
      console.log(rawData);
      //获取提交进来的数据
      var params = qs.parse(rawData);
      
      //将这些数据，存入数据库
      MongoClient.connect(url,{useNewUrlParser:true},(error,client) => {
        //client 是数据库的连接对象
        if (error) {
          console.log(error.message);
          console.log('连接数据库失败')
        }else{
          console.log('连接数据库成功');

          //选择某个数据库(db)

          var db = client.db('try');

          //使用db选择集合，并进行其他操作
          db.collection('users').insertOne({

            name: params.username,
            pwd: params.password
          },(err) => {
            if (err) {
              console.log(err.message)
              console.log('注册失败');
            }else{
              console.log('注册成功')
            }

            //操作完成后，将数据库连接关闭
            client.close();
            //在关闭请求
            res.end();

          });
        }
      });
    });
  },

  //登录请求
  loginFn(req,res){
    res.writeHead(200,{
      'Content-Type':'text/html; charset=utf-8'
    });

    //获取传进来的数据
    var rawData ='';
    req.on('data',(chunk) => {

      rawData+=chunk;
    });

    req.on('end',() => {
      console.log(rawData);
      var params = qs.parse(rawData);

      //连接数据库
      MongoClient.connect(url,{useNewUrlParser:true},(error,client) => {
        if (error) {
           console.log(error.message);
           console.log('连接数据库失败');
         
        }else{
          console.log('连接数据库成功');

          //连接数据库
          var db = client.db('try')
          //连接数据库中的集合  
          db.collection('users').find({
            name:params.username,
            pwd:params.password

          }).count((err,num) =>{
            if (err) {
              console.log('查询失败');
            }else{
              console.log('查询成功');
              if (num === 1) {
                console.log('登入成功');
                res.write('登入成功');

              }else{

                console.log('登录失败');
                res.write('用户名或密码不正确');
              }  
              client.close();
              res.end();
            }

          });  

        }
      });
    });
  }
}