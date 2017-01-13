const http = require('http')
const test = require('eater/runner').test
const express = require('express')
const earlyHints = require('../')
const mustCall = require('must-call')
const AssertStream = require('assert-stream')
const assert = require('assert')
const path = require('path')

test('as express middleware', () => {
  const app = express()
  app.use(earlyHints([
    { path: '/style.css', rel: 'preload' },
    { path: '/main.js', rel: 'preload', as: 'script' },
    { path: '/font.woff', as: 'font' }
  ]))
  app.use(express.static(path.join(__dirname, 'public')))

  const server = app.listen('0', mustCall(() => {
    http.get(`http://localhost:${server.address().port}/`,
      mustCall((res) => {
        assert.strictEqual(res.statusCode, 103)
        assert.strictEqual(res.statusMessage, 'Early Hints')
        assert.deepStrictEqual(res.headers, {
          link: '</style.css>; rel=preload; , </main.js>; rel=preload; as=script;, </font.woff>; rel=preload; as=font;'
        })
        const assertStream = new AssertStream()
        assertStream.expect(/<body>Hello<\/body>/)
        res.connection.pipe(assertStream)
        server.close()
      })
    )
  }))
})
