import axios from "axios";
import { FetchResult } from "../types";

const TIMEOUT_MS = 10_000;

// Mimic a real browser — some servers block requests without a User-Agent
const USER_AGENT =
  'Mozilla/5.0 (compatible; LegacyLift/1.0; +https://legacylift.dev)';

export async function fetchHtml(url: string): Promise<FetchResult> {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      maxRedirects: 5,
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      // Return raw string — don't let axios try to parse it
      responseType: 'text',
    });

    return {
      html: response.data as string,
      finalUrl: response.request?.res?.responseUrl ?? url,
      statusCode: response.status,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`);
      }
      if (error.response) {
        throw new Error(
          `Target site returned ${error.response.status}: ${error.response.statusText}`
        );
      }
      if (error.code === 'ENOTFOUND') {
        throw new Error(`Could not reach the URL — domain not found`);
      }
    }
    throw new Error(`Failed to fetch URL`);
  }
}
