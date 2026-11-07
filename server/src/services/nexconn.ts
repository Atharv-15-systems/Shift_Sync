import crypto from 'crypto';

export interface NexconnTokenResponse {
  success: boolean;
  token?: string;
  userId: string;
  error?: string;
  isConfigured: boolean;
}

export function getNexconnConfig() {
  const appKey = process.env.NEXCONN_APP_KEY || '';
  const appSecret = process.env.NEXCONN_APP_SECRET || '';
  const apiDomain = process.env.NEXCONN_API_DOMAIN || 'https://api.nexconn.ai';

  return {
    appKey,
    appSecret,
    apiDomain,
    isConfigured: Boolean(appKey && appSecret && appKey !== 'your_nexconn_app_key_here')
  };
}

/**
 * Generates signature headers for Nexconn Server-to-Server API
 * Header format per official Nexconn Server SDK:
 * App-Key, Nonce, Timestamp, Signature (SHA1 of AppSecret + Nonce + Timestamp)
 */
export function generateNexconnSignHeaders(appKey: string, appSecret: string) {
  const nonce = crypto.randomBytes(8).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signatureRaw = `${appSecret}${nonce}${timestamp}`;
  const signature = crypto.createHash('sha1').update(signatureRaw).digest('hex');

  return {
    'App-Key': appKey,
    'Nonce': nonce,
    'Timestamp': timestamp,
    'Signature': signature,
    'Content-Type': 'application/json'
  };
}

/**
 * Issues a real access token from the Nexconn User Management API
 * If credentials are not yet configured in .env, reports clear status.
 */
export async function issueNexconnToken(
  userId: string,
  name: string,
  avatarUrl: string = ''
): Promise<NexconnTokenResponse> {
  const config = getNexconnConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      userId,
      isConfigured: false,
      error: 'NEXCONN_APP_KEY and NEXCONN_APP_SECRET are not configured in environment variables.'
    };
  }

  try {
    const headers = generateNexconnSignHeaders(config.appKey, config.appSecret);
    const endpoint = `${config.apiDomain}/user/getToken.json`;

    // Form-encoded or JSON payload accepted by Nexconn Token Issue API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        name,
        portraitUri: avatarUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        userId,
        isConfigured: true,
        error: `Nexconn API error (${response.status}): ${errorText}`
      };
    }

    const data = await response.json() as any;
    if (data.token) {
      return {
        success: true,
        token: data.token,
        userId,
        isConfigured: true
      };
    }

    return {
      success: false,
      userId,
      isConfigured: true,
      error: data.errorMessage || 'Unknown token issue error'
    };
  } catch (err: any) {
    return {
      success: false,
      userId,
      isConfigured: true,
      error: `Failed to connect to Nexconn API: ${err.message}`
    };
  }
}

