/**
 * Claude AI API wrapper with robust error handling
 * - Timeout: 10 seconds
 * - Retry: 1 automatic retry on network failure
 * - Fallback: Graceful mock response on API failure
 * - Security: Never crashes the app, always has a fallback
 */

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 1;

class APIError extends Error {
  constructor(message, status, retryable = true) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.retryable = retryable;
  }
}

async function fetchWithTimeout(url, options, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, true);
    }
    throw error;
  }
}

export async function callClaude(prompt, fallbackResponse = null) {
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_CLAUDE_API_KEY || 'sk-'}`
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      // Handle authentication errors (401, 403) — don't retry
      if (response.status === 401 || response.status === 403) {
        throw new APIError('API authentication failed', response.status, false);
      }

      // Handle rate limiting (429) — retry once
      if (response.status === 429 && attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        continue;
      }

      // Handle server errors (5xx) — retry once
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      // Handle other errors
      if (!response.ok) {
        throw new APIError(`API error: ${response.statusText}`, response.status, false);
      }

      const data = await response.json();

      // Parse response
      if (!data.content || !Array.isArray(data.content)) {
        throw new Error('Invalid API response format');
      }

      const text = data.content.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      
      try {
        return JSON.parse(clean);
      } catch (parseError) {
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }

    } catch (error) {
      lastError = error;
      
      // If not retryable, throw immediately
      if (error instanceof APIError && !error.retryable) {
        throw error;
      }

      // If this was the last attempt, throw
      if (attempt === MAX_RETRIES) {
        throw error;
      }

      console.warn(`Claude API attempt ${attempt + 1} failed:`, error.message, 'Retrying...');
      // Continue to next retry
    }
  }

  // If we get here, we've exhausted retries
  throw lastError || new APIError('Claude API failed after retries', 503);
}

/**
 * Safe wrapper that never throws — always returns a result
 * Useful for non-critical AI features that should gracefully degrade
 */
export async function callClaudeSafe(prompt, fallbackResponse = {}) {
  try {
    return await callClaude(prompt);
  } catch (error) {
    console.error('Claude API error (using fallback):', error.message);
    
    if (fallbackResponse && typeof fallbackResponse === 'object') {
      return fallbackResponse;
    }

    // Return generic fallback based on error type
    if (error instanceof APIError && error.status === 401) {
      return {
        error: 'AI feature unavailable',
        reason: 'Authentication failed',
        fallback: true
      };
    }

    return {
      error: 'AI request failed',
      reason: error.message,
      fallback: true
    };
  }
}

/**
 * Check API health and connectivity
 */
export async function checkClaudeAPI() {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "OPTIONS",
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response.ok || response.status === 405; // 405 is normal for OPTIONS
  } catch (error) {
    console.warn('Claude API health check failed:', error.message);
    return false;
  }
}

