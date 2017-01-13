# early-hints

Early Hints is a new status code for HTTP/2 push. If you need to push some resources, you need to write `preload` Link Header.

```
HTTP/1.1 200 OK
Content-Type: text/html
Date: Fri, 13 Jan 2017 04:43:07 GMT
Connection: keep-alive
Transfer-Encoding: chunked
Link: </style.css> rel=preload

<html>
  <link rel="stylesheet" type="text/css" href="style.css">
  <body>Hello</body>
</html>
```

However, it is not always possible to respond immediately after receiving requests. some web apps have databases, cache servers, other middlewares. these web apps need to access these middlewares to determine status code and body response. Pushed contents can be sent earlier than determining status code.

Early Hints can help this situation, if you use Early Hints, you can send these Link Headers before status code.

```
HTTP/1.1 103 Early Hints
Link: </style.css> rel=preload

HTTP/1.1 200 OK
Content-Type: text/html
Date: Fri, 13 Jan 2017 04:43:07 GMT
Connection: keep-alive
Transfer-Encoding: chunked

<html>
  <link rel="stylesheet" type="text/css" href="style.css">
  <body>Hello</body>
</html>
```

# install

```
$ npm install early-hints --save
```

# usage

Basic usage

```javascript
const http = require('http')
const fs = require('fs')
const earlyHints = require('early-hints')

const server = http.createServer((req, res) => {
  console.log(req.url)
  if (req.url === '/') {
    earlyHints(['/style.css'])(req, res)
  } else if (req.url === '/style.css') {
    res.setHeader('Content-Type', 'text/css')
    return fs.createReadStream(__dirname + req.url).pipe(res) 
  }
  
  res.setHeader('Content-Type', 'text/html')
  fs.createReadStream(__dirname + '/index.html').pipe(res)
}).listen(3000)
```

With Express

```javascript
const express = require('express')
const app = express()
const earlyHints = require('early-hints')
app.use(earlyHints([
  { path: '/style.css', rel: 'preload' },
  { path: '/main.js', rel: 'preload', as: 'script' },
  { path: '/font.woff', as: 'font' }
]))
app.use(express.static(path.join(__dirname, 'public')))
app.listen(3000)
```

# License

MIT

