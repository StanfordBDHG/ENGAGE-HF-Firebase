#!/usr/bin/node

const admin = require('firebase-admin')
const fs = require('node:fs')

admin.initializeApp({
    credential: admin.credential.cert('credentials.json')
})

const useIndicesAsKeys = false

async function setStructuredCollection(collection, data) {
    if (Array.isArray(data)) {
        data.forEach(async (value, index) => {
            await setStructuredDocument(useIndicesAsKeys ? collection.doc(String(index)) : collection.doc(), value)
        })
    } else {
        for (const key of Object.keys(data)) {
            await setStructuredDocument(collection.doc(key), data[key])
        }
    }
}

async function setStructuredDocument(document, data) {
    if (typeof data !== 'object') {
        await document.set(data)
    } else {
        const dataWithoutSubcollections = {}
        for (const key of Object.keys(data)) {
            const value = data[key]
    
            if (Array.isArray(value)) {
                await setStructuredCollection(document.collection(key), value)
            } else {
                dataWithoutSubcollections[key] = value
            }
        }
        await document.set(dataWithoutSubcollections)
    }
}

async function setStructuredCollectionFromFile(collection, filename) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'))
    await setStructuredCollection(collection, data)
}

const db = admin.firestore()
setStructuredCollectionFromFile(db.collection('videoSections'), 'data/videoSections.json')
    .then(() => console.log('Video sections successfully uploaded to Firestore'))
    .catch(error => console.error('Video sections failed due to', error))