import { Injectable, signal } from '@angular/core';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: GroqMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GroqService {
  private readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  // API Key almacenada en localStorage (en producción usar variables de entorno)
  private _apiKey = signal<string | null>(localStorage.getItem('groq_api_key'));

  get apiKey() {
    return this._apiKey();
  }

  get isConfigured() {
    return !!this._apiKey();
  }

  setApiKey(key: string): void {
    localStorage.setItem('groq_api_key', key);
    this._apiKey.set(key);
  }

  removeApiKey(): void {
    localStorage.removeItem('groq_api_key');
    this._apiKey.set(null);
  }

  async chat(request: GroqRequest): Promise<GroqResponse> {
    const apiKey = this._apiKey();
    if (!apiKey) {
      throw new Error('API Key de Groq no configurada');
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...request,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Método simplificado para una sola pregunta
  async ask(
    prompt: string,
    options?: {
      model?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const messages: GroqMessage[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await this.chat({
      model: options?.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024
    });

    return response.choices[0]?.message?.content || '';
  }

  // Procesar datos con template de prompt
  async processWithTemplate(
    template: string,
    variables: Record<string, unknown>,
    options?: {
      model?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    // Reemplazar variables en el template
    let prompt = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return this.ask(prompt, options);
  }

  // Validar API key con una llamada simple
  async validateApiKey(): Promise<boolean> {
    try {
      await this.chat({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      });
      return true;
    } catch {
      return false;
    }
  }

  // Obtener modelos disponibles
  getAvailableModels() {
    return [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Modelo más capaz y versátil' },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile', description: 'Alto rendimiento general' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Rápido y eficiente' },
      { id: 'llama-guard-3-8b', name: 'Llama Guard 3 8B', description: 'Seguridad y moderación' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Excelente para código' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Modelo de Google, compacto' }
    ];
  }
}
