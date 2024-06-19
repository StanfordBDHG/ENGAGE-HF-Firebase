#!/usr/bin/node

import * as admin from 'firebase-admin'
import * as fs from 'node:fs'

initializeApp({
    credential: admin.credential.cert('credentials.json')
})

const useIndices = true

async function setStructuredCollection(collection, data) {
    if (Array.isArray(data)) {
        data.forEach(async (value, index) => {
            await setStructuredDocument(useIndices ? collection.doc(String(index)) : collection.doc(), value)
        })
    } else {
        for (const key of Object.keys(data)) {
            const value = data[key]
    
            await setStructuredDocument(collection.doc(key), value)
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
setStructuredCollectionFromFile(db.collection('videoSections'), 'videoSections.json')
    .then(() => console.log('Video sections successfully uploaded to Firestore'))
    .catch(error => console.error('Video sections failed due to', error))