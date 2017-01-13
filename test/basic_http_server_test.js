const http = require('http')
const fs = require('fs')
const path = require('path')
const earlyHints = require('../')
const AssertStream = require('assert-stream')
const assert = require('assert')
const test = require('eater/runner').test
const mustCall = require('must-call')

test('return 103 early hints', () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      earlyHints(['/style.css'])(req, res)
    } else if (req.url === '/style.css') {
      res.setHeader('Content-Type', 'text/css')
      return fs.createReadStream(path.join(__dirname, req.url)).pipe(res)
    }

    res.setHeader('Content-Type', 'text/html')
    fs.createReadStream(path.join(__dirname, '/index.html')).pipe(res)
  }).listen(0, () => {
    http.get(`http://localhost:${server.address().port}/`, mustCall((res) => {
      assert.strictEqual(res.statusCode, 103)
      assert.strictEqual(res.statusMessage, 'Early Hints')
      assert.deepStrictEqual(res.headers, {
        link: '</style.css>; rel=preload'
      })
      const assertStream = new AssertStream()
      assertStream.expect(/200 OK/)
      res.connection.pipe(assertStream)
      server.close()
    }))
  })
})

test('return 103 early hints to use path and rel', () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      earlyHints([
        { path: '/style.css', rel: 'preload' },
        { path: '/main.js', rel: 'preload', as: 'script' },
        { path: '/page.woff', as: 'font' }
      ])(req, res)
    }

    res.setHeader('Content-Type', 'text/html')
    fs.createReadStream(path.join(__dirname, '/index.html')).pipe(res)
  }).listen(0, () => {
    http.get(`http://localhost:${server.address().port}/`, mustCall((res) => {
      assert.strictEqual(res.statusCode, 103)
      assert.strictEqual(res.statusMessage, 'Early Hints')
      assert.deepStrictEqual(res.headers, {
        link: '</style.css>; rel=preload; , </main.js>; rel=preload; as=script;, </page.woff>; rel=preload; as=font;'
      })
      const assertStream = new AssertStream()
      assertStream.expect(/200 OK/)
      res.connection.pipe(assertStream)
      server.close()
    }))
  })
})
