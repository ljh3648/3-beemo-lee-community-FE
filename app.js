const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const app = express()
const port = 3000
const path = require('path')

// API 프록시 설정 - /api/* 요청을 api-server(8080)로 전달 (가장 먼저 처리)
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8080/api',
  changeOrigin: true
}));

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
  console.log(`Example app listening on port ${port}`)
})   