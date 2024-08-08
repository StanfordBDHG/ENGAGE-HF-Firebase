//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export class MockFirestore {
  collections = new Map<string, Map<string, unknown>>()

  collection(path: string) {
    return new MockFirestoreCollectionRef(this, path)
  }

  doc(path: string) {
    return new MockFirestoreDocRef(this, path)
  }

  replaceAll(record: Record<string, Record<string, unknown>>) {
    this.collections = new Map<string, Map<string, unknown>>()
    for (const collectionName in record) {
      const collection = record[collectionName]
      const collectionMap = new Map<string, unknown>()
      this.collections.set(collectionName, collectionMap)
      for (const docName in collection) {
        collectionMap.set(docName, collection[docName])
      }
    }
  }

  runTransaction(
    callback: (transaction: MockFirestoreTransaction) => Promise<void>,
  ) {
    return callback(new MockFirestoreTransaction())
  }
}

class MockFirestoreTransaction {
  get(reference: MockFirestoreRef) {
    return (reference as any).get()
  }

  create(reference: MockFirestoreDocRef, data: any) {
    reference.create(data)
  }

  set(reference: MockFirestoreDocRef, data: any) {
    reference.set(data)
  }

  update(reference: MockFirestoreDocRef, data: any) {
    reference.update(data)
  }

  delete(reference: MockFirestoreDocRef) {
    reference.delete()
  }
}

class MockFirestoreRef {
  firestore: MockFirestore
  path: string

  constructor(firestore: MockFirestore, path: string) {
    this.firestore = firestore
    this.path = path
  }

  collection(path: string) {
    return new MockFirestoreCollectionRef(
      this.firestore,
      `${this.path}/${path}`,
    )
  }

  doc(path: string) {
    return new MockFirestoreDocRef(this.firestore, `${this.path}/${path}`)
  }
}

class MockFirestoreCollectionRef extends MockFirestoreRef {
  get() {
    const result = this.firestore.collections.get(this.path) ?? new Map()
    const docs: any[] = []
    let size = 0
    result.forEach((value, key) => {
      size += 1
      docs.push({
        id: key,
        exists: true,
        ref: this.doc(key as string) as any,
        data: () => value,
      })
    })
    return {
      docs: docs,
      ref: this as any,
      size: size,
    }
  }
}

class MockFirestoreDocRef extends MockFirestoreRef {
  get() {
    const pathComponents = this.path.split('/')
    const collectionPath = pathComponents.slice(0, -1).join('/')
    const result = this.firestore.collections
      .get(collectionPath)
      ?.get(pathComponents[pathComponents.length - 1])
    return {
      exists: result !== undefined,
      id: pathComponents[pathComponents.length - 1],
      ref: this as any,
      data: () => result as any,
    }
  }

  create(data: any) {
    const pathComponents = this.path.split('/')
    const collectionPath = pathComponents.slice(0, -1).join('/')
    if (this.firestore.collections.get(collectionPath) === undefined)
      this.firestore.collections.set(collectionPath, new Map())
    if (
      this.firestore.collections
        .get(collectionPath)
        ?.get(pathComponents[pathComponents.length - 1]) !== undefined
    )
      throw new Error('Document already exists')
    this.firestore.collections
      .get(collectionPath)
      ?.set(pathComponents[pathComponents.length - 1], data)
  }

  listCollections() {
    const prefix = this.path + '/'
    const result: string[] = []
    this.firestore.collections.forEach((_, key) => {
      if (!key.startsWith(prefix)) return
      const collectionName = key.slice(prefix.length)
      if (collectionName.includes('/')) return
      result.push(collectionName)
    })
    return result
  }

  set(data: any) {
    const pathComponents = this.path.split('/')
    const collectionPath = pathComponents.slice(0, -1).join('/')
    if (this.firestore.collections.get(collectionPath) === undefined)
      this.firestore.collections.set(collectionPath, new Map())
    this.firestore.collections
      .get(collectionPath)
      ?.set(pathComponents[pathComponents.length - 1], data)
  }

  update(data: any) {
    const value = this.get().data()
    this.set({ ...value, ...data })
  }

  delete() {
    const pathComponents = this.path.split('/')
    const collectionPath = pathComponents.slice(0, -1).join('/')
    this.firestore.collections
      .get(collectionPath)
      ?.delete(pathComponents[pathComponents.length - 1])
  }
}
