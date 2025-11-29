import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Configuración de CORS para permitir peticiones
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 1. Obtener la clave segura del entorno
    const apiKey = process.env.GEMINI_API_KEY;

    // DEBUG LOGS (Check Vercel Functions logs)
    console.log("API Key configured:", !!apiKey);
    if (apiKey) {
        console.log("API Key length:", apiKey.length);
        console.log("API Key start:", apiKey.substring(0, 4) + "...");
    } else {
        console.error("API Key is MISSING in environment variables!");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // 2. Obtener el mensaje que envía el frontend
        const { message } = req.body;

        // 3. Llamar a Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        // 4. Devolver la respuesta al frontend
        res.status(200).json({ text });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message || 'Error procesando la solicitud' });
    }
}
