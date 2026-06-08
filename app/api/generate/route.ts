import Groq from 'groq-sdk';
import Replicate from 'replicate';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { roomType, length, width, style, budget } = await req.json();

    if (!roomType || !length || !width || !style || !budget) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Use Groq to build a rich image generation prompt
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const promptCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an expert interior design prompt engineer for Stable Diffusion XL. 
Your job is to convert room requirements into detailed, photorealistic image generation prompts.
Always output ONLY the image prompt — no explanation, no preamble, no quotes.
Include: lighting conditions, materials, color palette, furniture style, architectural details.
Always end with: photorealistic, 8k, interior design photography, professional lighting`,
        },
        {
          role: 'user',
          content: `Generate 4 DIFFERENT Stable Diffusion prompts for:
Room type: ${roomType}
Room size: ${length} feet x ${width} feet
Design style: ${style}
Budget: ${budget}
Location: Indian home

Each prompt should show a distinctly different design variation.
Output as JSON array with 4 strings, like: ["prompt1", "prompt2", "prompt3", "prompt4"]
No other text outside the JSON array.`,
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
      // Fallback if JSON parse fails
      const fallback = `${style} ${roomType}, ${length}ft x ${width}ft, Indian home interior, ${budget} budget, photorealistic, 8k, professional lighting`;
      prompts = [fallback, fallback, fallback, fallback];
    }

    // Step 2: Generate all 4 images in parallel via Replicate
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const imagePromises = prompts.slice(0, 4).map(async (prompt, i) => {
      try {
        const output = await replicate.run(
          'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          {
            input: {
              prompt,
              negative_prompt: 'blurry, low quality, distorted, unrealistic, cartoon, anime, sketch',
              width: 1024,
              height: 768,
              num_outputs: 1,
              num_inference_steps: 30,
              guidance_scale: 7.5,
            },
          }
        );

        const imageUrl = Array.isArray(output) ? output[0] : output;
        return { url: imageUrl as string, prompt, index: i };
      } catch (err) {
        console.error(`Image ${i} failed:`, err);
        return { url: null, prompt, index: i };
      }
    });

    const results = await Promise.all(imagePromises);

    return Response.json({
      images: results,
      roomDetails: { roomType, length, width, style, budget },
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return Response.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}
