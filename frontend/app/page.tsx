//
// This source file is part of the Stanford Biodesign Digital Health Next.js Template open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

'use client';

import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, EmailAuthProvider, getAuth, linkWithCredential, signInAnonymously, signOut } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "some-api-key",
  authDomain: "http://example.com",
  databaseURL: "http://example.com",
  projectId: "some-project-id",
  storageBucket: "some-storage-bucket",
  messagingSenderId: "1234567890"
})
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://localhost:9099')

const firestore = getFirestore(app)
connectFirestoreEmulator(firestore, 'localhost', 8080)

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-row items-center">
        <button
          style={{width: '100pt', height: '50pt', color: 'white', backgroundColor: 'blue'}}
          onClick = {
            async () => {
              try {
                if (auth.currentUser) {
                  await signOut(auth)
                }
                const user = await signInAnonymously(auth)
                console.log(
                  'Successfully logged in anonymously as', 
                  JSON.stringify(user)
                )
                const credential = EmailAuthProvider.credential(`${new Date().getTime()}@test.com`, 'password')
                const linkedUser = await linkWithCredential(auth.currentUser!, credential)
                console.log(
                  'Successfully linked credential as', 
                  JSON.stringify(linkedUser)
                )
              } catch (error) {
                console.error(error)
              }
            }
          }
        >
          Anonymous Link
        </ button>
        <button
          style={{width: '100pt', height: '50pt', color: 'white', backgroundColor: 'red'}}
          onClick = {
            async () => {
              if (auth.currentUser) {
                await signOut(auth)
              }
              const user = await createUserWithEmailAndPassword(
                auth, 
                `${new Date().getTime()}@test.com`, 
                'password'
              )
              console.log(
                'Successfully logged in as', 
                JSON.stringify(user)
              )
            }
          }
        >
          Create new user
        </ button>
      </div>
    </div>
  )
}
