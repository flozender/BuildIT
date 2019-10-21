const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const request = require('request');
const cookieParser = require('cookie-parser');
var path = require('path');


let serverRoute = 'http://localhost:5000';

const app = express();
app.options('*', cors());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs');
app.use(cookieParser());

app.use('/', express.static(__dirname + '/'));
app.use('/ide', express.static(path.resolve('../IDE')));


app.use('/contests', express.static(__dirname + '/'));
app.use('/contests/questions', express.static(__dirname + '/'));


app.get('/', async (req, res) => {
  res.render('home', {imgUsername: req.cookies.username});
});
app.get('/index', async (req, res) => {
  res.render('home', {imgUsername: req.cookies.username});
});
app.get('/home', async (req, res) => {
  res.render('home', {imgUsername: req.cookies.username});
});
app.get('/about', async (req, res) => {
  res.render('about', {imgUsername: req.cookies.username});
});

app.get('/profile', async (req, res) => {
  let options = {
    url : serverRoute + '/users/' + req.cookies.username.toLowerCase(),
    method: 'get',
    headers: {
      'authorization': req.cookies.token
    },
    json: true
  }
  request(options, function(err, response, body){
    res.render('profile', {data: body, imgUsername: req.cookies.username});
  });

});

app.get('/login', async (req, res) => {
  res.render('login');
});

app.get('/admin/add/question', async (req, res) => {
  res.render('questionadd');
});
app.get('/admin/add/contest', async (req, res) => {
  res.render('contestadd');
});
app.get('/admin/update/question', async (req, res) => {
  res.render('questionupdate');
});
app.get('/admin/update/contest', async (req, res) => {
  res.render('contestupdate');
});
app.get('/admin/manageusers', async (req, res) => {
  res.render('manageusers');
});
app.get('/admin/results', async (req, res) => {
  let options = {
    url : serverRoute + '/contests',
    method: 'get',
    headers: {
      'authorization': req.cookies.token
    },
    json: true
  }

  request(options, function(err, response, body){
    res.render('results', {data: body});
  });
});

app.get('/admin/:contestId/table', async (req, res) => {
  res.render('table');
});

app.get('/admin', async (req, res) => {
  res.render('contestadd');
});

app.get('/ide/:questionId', async (req, res) => {
  let questionId = req.params.questionId;
  res.sendFile(path.resolve('../IDE/index.html'));
});


app.get('/contest', async (req, res) => {
  let options = {
    url : serverRoute + '/contests',
    method: 'get',
    headers: {
      'authorization': req.cookies.token
    },
    json: true
  }
  
  request(options, function(err, response, body){
    // console.log(body);  
    res.render('contest', {imgUsername: req.cookies.username, data: body});
    
  });
});

app.get('/contests/:contestId', async (req, res) => {
  // Add participation
  let options1 = {
    url : serverRoute + '/participations',
    method: 'post',
    headers: {
      'authorization': req.cookies.token
    },
    body: {
      contestId: req.params.contestId 
    },
    json: true
  }

  request(options1, function(err, response, body){

    let options = {
      url : serverRoute + '/questions/contests/'+req.params.contestId,
      method: 'get',
      headers: {
        'authorization': req.cookies.token
      },
      json: true
    }
    // Get questions for contest
    request(options, function(err, response, body){
      res.cookie('contestId',req.params.contestId);
        let options3 ={
          url: serverRoute + '/participations/' + req.params.contestId,
          method: 'get',
          headers: {
            'authorization': req.cookies.token
          },
          json: true
       }
      // get participation details
      request(options3, function(err, response, bodytimer){
        // console.log(JSON.stringify(bodytimer, null, 4));
        // console.log(JSON.stringify(body, null, 4));
        bodytimer = bodytimer[0];
        let questions = [];
        let scores = [];
        for (let i = 0; i < body.length; i++){
          questions[i] = body[i].questionId;
        }
        for (let i = 0; i < questions.length; i++){
          let maxScore = 0;
          for(let j = 0; j < bodytimer.submissionResults.length; j++){
            if (bodytimer.submissionResults[j].questionId === questions[i]){
              if (maxScore < bodytimer.submissionResults[j].score){
                maxScore = bodytimer.submissionResults[j].score;
              }
            }
          }
          scores[i] = maxScore;
        }
        for (let i = 0; i < body.length; i++){
          for(let j = 0; j < questions.length; j++){
            if (body[i].questionId === questions[j]){
              body[i].score = scores[j];
            }
          }
        }
        for (let i = 0; i < body.length; i++){
          if (body[i].score === 100){
            body[i].color = "green";
          } else if (body[i].score === 50){
            body[i].color = "orange";
          } else if (body[i].score === 25) {
            body[i].color = "red";
          } else {
            body[i].color = "black";
          }
        }
        res.render('questions', {imgUsername: req.cookies.username, data: body, datatimer: bodytimer});
      });
    });
  });
});

app.post('/signup_', async (req, res) => {
  // res.render('/home');
  let options = {
    url : serverRoute + '/signup',
    method: 'post',
    body: {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    },
    json: true
  }
  request(options, function(err, response, body){
    console.log(body);
        if (body.success){
          body.message = "Sign up successful, Account verification has been sent to your email";
        } else {
          body.message = "Registration Failed";
        }
        res.render('error', {data: body, imgUsername: req.cookies.username})

  });
});
app.post('/login_', async (req, res) => {
  let options = {
    url : serverRoute + '/signup',
    method: 'post',
    body: {
      username: req.body.username,
      password: req.body.password
    },
    json: true
  }
  request(options, function(err, response, body){
    console.log(body);
        // if (body.success){
        //   body.message = "Sign up successful, Account verification has been sent to your email";
        // } else {
        //   body.message = "Registration Failed";
        // }
        // res.render('error', {data: body, imgUsername: req.cookies.username})

  });
});

app.get('/logout', async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('username');
  res.clearCookie('contestId');
  res.redirect('/home');
});

app.get('/error', async (req, res) => {
  res.render('error', {imgUsername: req.cookies.username});
});

app.get('/contests/questions/:questionId', async (req, res) => {
  let options = {
    url : serverRoute + '/questions/'+req.params.questionId,
    method: 'get',
    headers: {
      'authorization': req.cookies.token
    },
    json: true
  }
  request(options, function(err, response, body){
    res.render('questiondesc', {imgUsername: req.cookies.username, data: body});
  });
});


app.listen(3000);
console.log('Server @ port 3000');