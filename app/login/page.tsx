"use client"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    console.log(password);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        if (result?.error) {
            console.log(result.error)
        } else {
            router.push("/")
        }
    }

    const handleProviderSignIn = async (provider: string) => {
        try {
            const result = await signIn(provider, { redirect: false })
            if (result?.error) {
                console.log(result.error)
            } else {
                router.push("/")
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder='Email' 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                        type="password" 
                        placeholder='Password' 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-4 space-y-2">
                    <button
                        onClick={() => handleProviderSignIn("google")}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-300"
                    >
                        Sign in with Google
                    </button>
                    <button
                        onClick={() => handleProviderSignIn("github")}
                        className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition duration-300"
                    >
                        Sign in with GitHub
                    </button>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a></p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage