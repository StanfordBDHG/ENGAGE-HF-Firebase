#!/usr/bin/node

const admin = require('firebase-admin')
const fs = require('node:fs')

admin.initializeApp({
    credential: admin.credential.cert('credentials.json')
})

const useIndicesAsKeys = true

async function setUnstructuredCollection(collection, data) {
    if (Array.isArray(data)) {
        for (let index = 0; index < data.length; index++) {
            await (useIndicesAsKeys ? collection.doc(String(index)) : collection.doc())
                .set(data[index])
        }
    } else {
        for (const key of Object.keys(data)) {
            collection.doc(key).set(data[key])
        }
    }
}

async function setStructuredCollection(collection, data) {
    if (Array.isArray(data)) {
        for (let index = 0; index < data.length; index++) {
            await setStructuredDocument(
                useIndicesAsKeys ? collection.doc(String(index)) : collection.doc(),
                data[index]
            )
        }
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

async function readJSON(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'))
}

async function main() {
    const db = admin.firestore()
    await setStructuredCollection(db.collection('videoSections'), await readJSON('data/videoSections.json'))
    console.log('Video sections uploaded')
    await setUnstructuredCollection(db.collection('questionnaires'), await readJSON('data/questionnaires.json'))
    console.log('Questionnaires uploaded')
}

main()
    .then(() => console.log('Success!'))
    .catch(error => console.error('Error:', error))