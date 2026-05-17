export interface User {
    id: string
    email: string
    name: string
    role: string
    phone: string | null
    bio: string | null
    profile_photo_url: string | null
    location: {
        city: string
        state: string
        lat: number
        lng: number
    } | null
    sitter_profile: {
        services: string[]
        nightly_rate: number
        experience_years: number
        accepted_dog_sizes: string[]
        accepts_puppies: boolean
        accepts_senior_dogs: boolean
        accepts_special_needs: boolean
        has_yard: boolean
        has_other_pets: boolean
        smoke_free_home: boolean
        stripe_account_id?: string
    } | null
    ai_summary: string | null
}

export interface Sitter {
    id: string
    name: string
    email: string
    bio: string | null
    location: {
        city: string
        state: string
        lat: number
        lng: number
    } | null
    sitter_profile: {
        services: string[]
        nightly_rate: number
        experience_years: number
        accepted_dog_sizes: string[]
        accepts_puppies: boolean
        accepts_senior_dogs: boolean
        accepts_special_needs: boolean
        has_yard: boolean
        has_other_pets: boolean
        smoke_free_home: boolean
    } | null
    ai_summary: string | null
    profile_photo_url: string | null
    distance_miles?: number
}

export interface Dog {
    id: string
    owner_id: string
    name: string
    breed: string
    age: number
    weight: number
    profile_photo_url: string | null
    dog_profile: {
        size: string
        energy_level: string
        temperament: string[]
        good_with_other_dogs: boolean
        good_with_cats: boolean
        good_with_children: boolean
        house_trained: boolean
        special_needs: string[]
        medical_notes: string | null
        vaccination_status: string
    } | null
}

export interface Booking {
    id: string
    owner_id: string
    sitter_id: string
    dog_id: string
    status: string
    start_date: string
    end_date: string
    total_price: number
}