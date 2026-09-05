import { NextRequest } from 'next/server';
import { checkRateLimit, toGuestQuotaStatus } from '../../../lib/rate-limit';
import { ENGINE_EXECUTORS } from '../../../lib/engines';
import type { DiagnosticEngineId, MasterTelemetryReport, SSEMessagePayload } from '../../../types/telemetry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALL_ENGINES: DiagnosticEngineId[] = [
  'health',
  'ai_ready',
  'repo',
  'latency',
  'eco',
  'compliance',
  'migration',
  'ai_search',
];

function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

function calculateGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 78) return 'B';
  if (score >= 68) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  const tier = (searchParams.get('tier') || 'visitor') as 'visitor' | 'free' | 'starter' | 'pro' | 'team' | 'enterprise' | 'superadmin';

  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'Target URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const targetUrl = normalizeUrl(rawUrl);

  // 1. Rate Limit Enforcement
  const rateLimitResult = await checkRateLimit(clientIp, tier, 1);
  if (!rateLimitResult.success) {
    const quota = toGuestQuotaStatus(rateLimitResult);
    return new Response(
      JSON.stringify({
        error: 'Daily telemetry scan quota reached.',
        quota,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitResult.headers,
        },
      }
    );
  }

  // 2. Stream Pipeline Setup
  const encoder = new TextEncoder();
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const domainSlug = new URL(targetUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const startedAt = new Date().toISOString();

  const customReadable = new ReadableStream({
    async start(controller) {
      function sendEvent(payload: SSEMessagePayload) {
        const message = `data: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(message));
      }

      // Send Initialization
      sendEvent({
        event: 'ENGINE_QUEUED',
        data: {
          reportId,
          targetUrl,
          totalEngines: ALL_ENGINES.length,
          rateLimit: toGuestQuotaStatus(rateLimitResult),
        },
        timestamp: Date.now(),
      });

      const engineResultsMap: Record<string, unknown> = {};
      let completedEnginesCount = 0;
      let scoreSum = 0;

      // Execute all 8 diagnostic engines concurrently
      const enginePromises = ALL_ENGINES.map(async (engineId) => {
        sendEvent({
          event: 'ENGINE_START',
          engineId,
          timestamp: Date.now(),
        });

        try {
          const executor = ENGINE_EXECUTORS[engineId];
          const result = await executor(targetUrl);
          engineResultsMap[engineId] = result;
          completedEnginesCount++;
          scoreSum += result.score || 0;

          // Stream completion event for this engine
          sendEvent({
            event: 'ENGINE_COMPLETE',
            engineId,
            progressPercent: Math.round((completedEnginesCount / ALL_ENGINES.length) * 100),
            data: result,
            timestamp: Date.now(),
          });
          return result;
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          completedEnginesCount++;
          const failedResult = {
            engineId,
            name: engineId,
            category: 'Performance',
            status: 'ERROR',
            executionTimeMs: 0,
            score: 25,
            rawLogStream: [`[FATAL_ERROR] Engine execution failure: ${errorMsg}`],
            error: errorMsg,
          };
          engineResultsMap[engineId] = failedResult;

          sendEvent({
            event: 'ENGINE_FAILED',
            engineId,
            progressPercent: Math.round((completedEnginesCount / ALL_ENGINES.length) * 100),
            error: errorMsg,
            data: failedResult,
            timestamp: Date.now(),
          });
          return failedResult;
        }
      });

      await Promise.allSettled(enginePromises);

      const overallScore = Math.round(scoreSum / ALL_ENGINES.length);
      const overallGrade = calculateGrade(overallScore);

      const finalReport: MasterTelemetryReport = {
        id: reportId,
        targetUrl,
        normalizedUrl: targetUrl,
        domainSlug,
        overallScore,
        grade: overallGrade,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        engines: engineResultsMap as any,
        startedAt,
        completedAt: new Date().toISOString(),
        totalDurationMs: Date.now() - new Date(startedAt).getTime(),
        isCompleted: true,
        initiatedBy: {
          tier,
          ipHash: clientIp.slice(0, 8),
        },
      };

      sendEvent({
        event: 'MASTER_COMPLETE',
        progressPercent: 100,
        data: finalReport,
        timestamp: Date.now(),
      });

      controller.close();
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...rateLimitResult.headers,
    },
  });
}
