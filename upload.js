#!/usr/bin/node

const admin = require('firebase-admin')
const fs = require('node:fs')
const rxnorm = require('./rxnorm')

admin.initializeApp({
    credential: admin.credential.cert('credentials.json')
})



main()
    .then(() => console.log('Success!'))
    .catch(error => console.error('Error:', error))