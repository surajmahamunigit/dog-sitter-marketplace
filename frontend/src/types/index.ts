export interface Sitter {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    location: {
        city: string;
        state: string;
        lat: number;
        lng: number;
    } | null;
    sitter_profile: {
        services: string[];
        rate_per_night: number;
        years_experience: number;
    } | null;
    ai_summary: string | null;
    profile_photo_url: string | null;
    distance_miles?: number;
    }

export interface Dog {
    id: string;
    owner_id: string;
    name: string;
    breed: string;
    age: number;
    weight: number;
    profile_photo_url: string | null;
    dog_profile: {
        energy_level: string;
        temperament: string;
        special_needs: string | null;
        medical_notes: string | null;
        vaccination_status: string;
    } | null;
}

export interface Booking {
    id: string;
    owner_id: string;
    sitter_id: string;
    dog_id: string;
    status: string;
    start_date: string;
    end_date: string;
    total_price: number;
}