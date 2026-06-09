import Groq from 'groq-sdk';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { roomType, length, width, style, budget } = await req.json();

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const promptCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an expert interior design prompt engineer. Output ONLY a JSON array of 4 strings. No explanation. No markdown.`,
        },
        {
          role: 'user',
          content: `4 DIFFERENT Stable Diffusion prompts for:
Room: ${roomType}, Size: ${length}ft x ${width}ft
Style: ${style}, Budget: ${budget}, Setting: Indian home interior
Each must show a distinctly different design variation.
End every prompt with: photorealistic, 8k, interior design photography
Output format: ["prompt1", "prompt2", "prompt3", "prompt4"]`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    let prompts: string[] = [];
    try {
      const content = promptCompletion.choices[0].message.content || '[]';
      const cleaned = content.replace(/```json|```/g, '').trim();
      prompts = JSON.parse(cleaned);
    } catch {
      const fallback = `${style} ${roomType}, Indian home, photorealistic, 8k`;
      prompts = [fallback, fallback, fallback, fallback];
    }

    // Return prompts only — browser will fetch images directly
    const results = prompts.slice(0, 4).map((prompt, i) => {
      const encoded = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 1000000);
      return {
        url: `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=768&seed=${seed}&nologo=true&model=flux`,
        prompt,
        index: i,
      };
    });

    return Response.json({ images: results, roomDetails: { roomType, length, width, style, budget } });

  } catch (error) {
    console.error('Generate API error:', error);
    return Response.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}