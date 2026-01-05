export interface CityData {
    id: string;
    name: string;
    center: [number, number]; // [lng, lat]
    bounds: {
        minLng: number;
        maxLng: number;
        minLat: number;
        maxLat: number;
    };
    description: string;
}

export const cities: CityData[] = [
    {
        id: "tokyo",
        name: "Tokyo",
        center: [139.75, 35.68],
        bounds: {
            minLng: 139.60,
            maxLng: 139.85,
            minLat: 35.60,
            maxLat: 35.75,
        },
        description: "The neon-lit sprawl of Neo-Tokyo. High density, high danger."
    },
    {
        id: "nyc",
        name: "New York",
        center: [-74.006, 40.7128],
        bounds: {
            minLng: -74.15,
            maxLng: -73.85,
            minLat: 40.60,
            maxLat: 40.85,
        },
        description: "The concrete jungle of Manhattan. Verticality is key."
    },
    {
        id: "london",
        name: "London",
        center: [-0.1276, 51.5072],
        bounds: {
            minLng: -0.25,
            maxLng: -0.05,
            minLat: 51.40,
            maxLat: 51.60,
        },
        description: "Mist-covered streets and ancient secrets hidden in plain sight."
    },
    {
        id: "mumbai",
        name: "Mumbai",
        center: [72.8777, 19.0760],
        bounds: {
            minLng: 72.75,
            maxLng: 73.00,
            minLat: 18.90,
            maxLat: 19.20,
        },
        description: "A bustling metropolis between the sea and the skyscrapers."
    },
    {
        id: "paris",
        name: "Paris",
        center: [2.3522, 48.8566],
        bounds: {
            minLng: 2.25,
            maxLng: 2.45,
            minLat: 48.75,
            maxLat: 48.95,
        },
        description: "The City of Light, now a battlefield of tactical intrigue."
    }
];
