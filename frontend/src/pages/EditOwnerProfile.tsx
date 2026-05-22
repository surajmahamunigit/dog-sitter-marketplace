import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateMe } from '../api/users'

export default function EditOwnerProfile() {
    const { user, setUser } = useAuth()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [city, setCity] = useState('')
    const [lat, setLat] = useState('')
    const [lng, setLng] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    

    // Pre-populate from existing user data on mount
    useEffect(() => {
        if (!user) return
        setName(user.name ?? '')
        setEmail(user.email ?? '')
    }, [user])

    async function handleSave() {
        setSaving(true)
        setError(null)
        
        try {
        const updated = await updateMe({
            name,
            email,
            location: city && lat && lng ? {
            city,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            } : undefined,
        })
        setUser({ ...user!, ...updated })
        navigate('/dashboard')
        } catch (err: any) {
        setError(err.response?.data?.detail ?? 'Failed to save profile.')
        } finally {
        setSaving(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto p-8 space-y-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>

        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Los Angeles"
                className="w-full border rounded px-3 py-2"
            />
            </div>

            <div className="flex gap-3">
            <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                type="number"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="e.g. 34.0522"
                className="w-full border rounded px-3 py-2"
                />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                type="number"
                value={lng}
                onChange={e => setLng(e.target.value)}
                placeholder="e.g. -118.2437"
                className="w-full border rounded px-3 py-2"
                />
            </div>
            </div>

            <p className="text-xs text-gray-400">
            Tip: find your lat/lng at{' '}
            <a href="https://www.latlong.net" target="_blank" className="underline">
                latlong.net
            </a>
            </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        

        <div className="flex gap-3">
            <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
            {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700"
            >
            Cancel
            </button>
        </div>
        </div>
    )
}