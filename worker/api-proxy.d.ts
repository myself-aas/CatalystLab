export function validateConfiguredOrigin(
  rawOrigin: string | undefined | null
): { valid: true; origin: string } | { valid: false; reason: string };

export function buildUpstreamHeaders(request: Request): Headers;

declare const worker: {
  fetch(request: Request, env: { API_ORIGIN?: string }): Promise<Response>;
};

export default worker;
