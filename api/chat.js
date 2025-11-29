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
    // TEMPORARY DEBUG: Hardcoded key to verify validity
    const apiKey = "AIzaSyBWNAYgiuWgMlD0GV5L4YCMIM_Z7pLfLgY";

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

        // 3. Llamar a Gemini con STREAMING
        // Usamos el modelo más avanzado disponible actualmente en la API estable
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        const result = await model.generateContentStream(message);

        // 4. Configurar headers para streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // 5. Iterar sobre el stream y enviar chunks al cliente
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }

        res.end();

    } catch (error) {
        console.error("API Error:", error);
        // Si ya empezamos a enviar datos (headers sent), no podemos enviar JSON de error.
        // En ese caso, terminamos la respuesta.
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Error procesando la solicitud' });
        } else {
            res.end();
        }
    }
}
