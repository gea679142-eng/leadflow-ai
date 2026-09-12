const DEEPSEEK_BASE = 'https://api.siliconflow.cn/v1';

export async function callDeepseek(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7
): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function optimizeKeywords(apiKey: string, topic: string): Promise<string> {
  return callDeepseek(
    apiKey,
    'You are a social media marketing expert. Given a topic, generate 5-10 specific search keywords that would find potential customers discussing related problems on social media. Return only the keywords, one per line.',
    topic,
    0.8
  );
}

export async function scoreLead(apiKey: string, leadInfo: string, productDesc: string): Promise<{ score: number; reason: string }> {
  const result = await callDeepseek(
    apiKey,
    'You are a lead qualification expert. Given a potential customer profile and a product description, score the lead 0-100 and give a one-sentence reason. Respond in JSON format: {"score": 85, "reason": "..."}',
    `Product: ${productDesc}\n\nCustomer: ${leadInfo}`,
    0.3
  );
  try {
    const cleaned = result.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { score: 50, reason: result.slice(0, 100) };
  }
}

export async function generateDm(apiKey: string, username: string, leadContext: string, productDesc: string): Promise<string> {
  return callDeepseek(
    apiKey,
    'You are a natural social media outreach writer. Write a short, friendly, non-spammy first message to a potential customer. Reference their recent content. Do not hard-sell. Keep it under 80 words. Sound human, not AI.',
    `Product/service: ${productDesc}\n\nTo: @${username}\n\nWhat they posted about: ${leadContext}\n\nWrite the DM:`,
    0.9
  );
}
