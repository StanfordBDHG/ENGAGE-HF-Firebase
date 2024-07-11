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
  collections: Record<string, Record<string, unknown>> = {}

  collection(path: string) {
    return new MockFirestoreCollectionRef(this, path)
  }

  doc(path: string) {
    return new MockFirestoreDocRef(this, path)
  }

  runTransaction(
    callback: (transaction: MockFirestoreTransaction) => Promise<void>,
  ) {
    return callback(new MockFirestoreTransaction(this))
  }
}

class MockFirestoreTransaction {
  private firestore: MockFirestore

  constructor(firestore: MockFirestore) {
    this.firestore = firestore
  }

  get(reference: MockFirestoreRef) {
    return (reference as any).get()
  }

  set(reference: MockFirestoreRef, data: any) {
    ;(reference as any).set(data)
  }

<<<<<<< HEAD
  update(reference: MockFirestoreRef, data: any) {
    ;(reference as any).update(data)
=======
  delete(reference: MockFirestoreRef) {
    ;(reference as any).delete()
>>>>>>> 82a1cde (Add admins and organizations to update script)
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
    const result = this.firestore.collections[this.path]
    return {
      docs: Object.keys(result || {}).map((key) => ({
        id: key,
        exists: true,
        ref: this.doc(key) as any,
        data: () => result[key] as any,
      })),
      ref: this as any,
      size: Object.keys(result || {}).length,
    }
  }
}

class MockFirestoreDocRef extends MockFirestoreRef {
  get() {
    const pathComponents = this.path.split('/')
    const collectionPath = pathComponents.slice(0, -1).join('/')
    const result =
      this.firestore.collections[collectionPath][
        pathComponents[pathComponents.length - 1]
      ]
    return {
      exists: result !== undefined,
      id: pathComponents[pathComponents.length - 1],
      ref: this as any,
      data: () => result as any,
    }
  }

  set(data: any) {
    const pathComponents = this.path.split('/')
    const collectionPath = pathComponents.slice(0, -1).join('/')
    if (
      !Object.keys(this.firestore.collections).some(
        (key) => key === collectionPath,
      )
    )
      this.firestore.collections[collectionPath] = {}
    this.firestore.collections[collectionPath][
      pathComponents[pathComponents.length - 1]
    ] = data
  }

<<<<<<< HEAD
  update(data: any) {
    const value = this.get().data()
    this.set({ ...value, ...data })
=======
  delete() {
    const pathComponents = this.path.split('/')
    const collectionPath = pathComponents.slice(0, -1).join('/')
    delete this.firestore.collections[collectionPath][
      pathComponents[pathComponents.length - 1]
    ]
>>>>>>> 82a1cde (Add admins and organizations to update script)
  }
}
