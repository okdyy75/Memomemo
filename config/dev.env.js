'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  FIREBASE_CONFIG : {
    apiKey: '"<apiKey>"',
    authDomain: '"<projectId>.firebaseapp.com"',
    databaseURL: '"https://<projectId>.firebaseio.com"',
    projectId: '"<projectId>"',
    storageBucket: '"<projectId>.appspot.com"',
    messagingSenderId: '"<messagingSenderId>"',
    appId: "'<appId>'"
  }
})
