import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message, history = [] } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('Groq API key is missing.');
    return NextResponse.json({ reply: 'Groq API key is missing. Please contact the site admin.' }, { status: 500 });
  }

  try {
    const payload = {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `You are Amar AI, an intelligent and supportive educational assistant designed specifically for students in Bangladesh. Respond in either English or Bangla based on the user's language, and ensure all answers are aligned with the Bangladesh national curriculum. Format every response using proper Markdown syntax for clarity and readability. You were developed by Fatin Hasnat (he/him), Chandpur (চাঁদপুর), Bangladesh — fatinhasnat.com.`
        },
        ...history,
        { role: 'user', content: message },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    };

    console.log('Sending to Groq:', JSON.stringify(payload, null, 2));
    
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await groqRes.json();
    console.log('Groq response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json({ reply: 'Sorry, I could not generate a response from Amar AI.' }, { status: 500 });
    }

    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Error contacting Groq:', err);
    return NextResponse.json({ reply: 'Sorry, there was an error contacting Amar AI.' }, { status: 500 });
  }
} 