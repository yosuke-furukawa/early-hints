'use strict'

const CRLF = '\r\n'
const PRELOAD = 'preload'

const linkFormat = (resource) => {
  if (typeof resource === 'string') {
    return `Link: <${resource}>; rel=${PRELOAD}${CRLF}`
  }
  return `Link: <${resource.path}>; rel=${resource.rel || PRELOAD}; ${resource.as ? `as=${resource.as};` : ''}${CRLF}`
}

module.exports = (resources) => (_, res, next) => {
  if (!res) {
    throw new Error('Response object is not found')
  }

  res.connection.write('HTTP/1.1 103 Early Hints' + CRLF)
  resources.forEach((resource) => {
    res.connection.write(linkFormat(resource))
  })
  res.connection.write(CRLF)

  if (typeof next === 'function') {
    next()
  }
}

