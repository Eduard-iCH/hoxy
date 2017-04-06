import UrlPath from './url-path'
import { Server as DocRootServer } from 'node-static'
import http from 'http'
module.exports = (() => {

  let getStatic = (() => { let statics = {}
    return docroot => {
      let stat = statics[docroot]
      if (!stat) {
        stat = statics[docroot] = new DocRootServer(docroot)
      }
      return stat
    }
  })()

  // Start up the server and serve out of various docroots.
  var promise = null

  function getServer() {
    return new Promise((resolve, reject) => {

      var server = http.createServer((req, resp) => {
          let docroot = req.headers['x-hoxy-static-docroot']
          let pDocroot = new UrlPath(docroot)
          let stat = getStatic(pDocroot.toSystemPath())
          stat.serve(req, resp)
        }).listen(0, 'localhost', function() {
          resolve(server)
        })
    })
  }

  function staticServer() {
    if(!promise)
      promise = getServer()

    return promise
  }

  staticServer.close = function() { 
    if(!promise)
      return
    promise.then(function(server) {
      return server.close()
    })
    promise = null
  }
  return staticServer
})()
