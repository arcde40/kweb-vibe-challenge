export interface ChallengeConstraints {
    id: number;
    letters: number;
    excludedLetters: string[];
    includedWords: string[];
}

export interface Criteria {
    id: number;
    description: string;
}

export interface Challenge {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    constraint: ChallengeConstraints;
    criteria: Criteria[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const fetchChallenge = async (): Promise<Challenge> => {
    try {
        const response = await fetch(`${BASE_URL}/challenges/random`);
        if (!response.ok) {
            throw new Error(`Failed to fetch from backend: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching challenge from backend.", error);
        // Fallback stub if backend is unreachable during dev
        return {
            id: 0,
            title: "Backend Unreachable: Build a fallback beautiful app.",
            description: "Backend Unreachable: Build a fallback beautiful app.",
            imageUrl: "",
            constraint: {
                id: 0,
                letters: 50,
                excludedLetters: ["가"],
                includedWords: ["테스트"],
            },
            criteria: [],
        };
    }
};

export interface RankingEntry {
    rank: number;
    ticketId: string;
    username: string;
    letterCount: number;
    createdAt: number;
}

export interface RankingSubmitResponse {
    rank: number;
    letterCount: number;
    entries: RankingEntry[];
}

export const createTrial = async (challengeId: number): Promise<{ ticketId: string }> => {
    const response = await fetch(`${BASE_URL}/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
    });
    return response.json();
};

export const submitRanking = async (challengeId: number, ticketId: string, username: string, letterCount: number): Promise<RankingSubmitResponse> => {
    const response = await fetch(`${BASE_URL}/ranking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, ticketId, username, letterCount }),
    });
    return response.json();
};

export const fetchRanking = async (challengeId: number): Promise<RankingEntry[]> => {
    const response = await fetch(`${BASE_URL}/ranking/${challengeId}`);
    return response.json();
};

export const API_BASE_URL = BASE_URL;
