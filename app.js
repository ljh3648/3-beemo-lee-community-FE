require('dotenv').config({ path: '.env' });

const express = require('express')
const app = express()
const port = process.env.PORT
const path = require('path')

// 정적 파일 서빙
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/html', express.static(path.join(__dirname, 'public/html')));

// 페이지 라우팅
app.get('/', (req, res) => {
  res.redirect('/signin');
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/signin.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/signup.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/home.html'));
});

app.get('/user/profile/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/user-profile-edit.html'));
});

app.get('/user/password/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/user-password-edit.html'));
});

app.get('/posts/create', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/make-post.html'));
});

app.use((req, res) => {
  res.status(404).send('페이지를 찾을 수 없습니다.');
});

app.listen(port, () => {
  console.log(`node app.js listening on port ${port}`)
})   