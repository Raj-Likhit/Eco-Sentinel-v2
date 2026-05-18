import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'GOOGLE_API_KEY is not set' },
                { status: 500 }
            );
        }

        const { message, contextData } = await req.json();

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemPrompt = `
            You are the Eco-Sentinel AI, an advanced autonomous system monitoring global pollution.
            
            Current Live Context:
            ${JSON.stringify(contextData, null, 2)}
            
            Your Mission:
            Analyze the provided environmental data and answer the user's question.
            
            Guidelines:
            1. Be concise (under 50 words unless asked for a detailed plan).
            2. Use a professional, slightly robotic but helpful tone.
            3. Cite specific metrics from the context (e.g., "PM2.5 is at 340 µg/m³").
            4. If the severity is CRITICAL, sound urgent. If SAFE, sound reassuring.
            
            User Question: ${message}
        `;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ response: text });

    } catch (error) {
        console.error('Agent API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
