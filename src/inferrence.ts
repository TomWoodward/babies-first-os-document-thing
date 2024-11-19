// @ts-ignore
import ollama from 'ollama/browser'

export async function generateOpenAI(promptContent: string) {
  const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`  

    },
    body: JSON.stringify({
      model: 'text-davinci-003',  
      prompt: promptContent,
      temperature: 0.7, // Adjust temperature as needed
      max_tokens: 1000 // Adjust max_tokens as needed
    })
  };

  try {
    const response = await fetch('https://api.openai.com/v1/completions', requestOptions);
    const data = await response.json();
    return data.choices[0].text.trim();  

  } catch (error) {
    console.error('Error calling ChatGPT API:', error);  

    return null;
  }
}

export async function generateOllama(promptContent: string) {
  const response = await ollama.generate({
    model: 'llama3',
    prompt: promptContent,
    stream: false,
  });

  return response.response;
}

export const generate = generateOllama;
