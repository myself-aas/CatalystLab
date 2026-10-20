import { Request, Response } from 'express';

// Reports, dossiers, and the blogs API (v1).
//
// OWNER DECISION (2026-10-19): these endpoints used to answer with fabricated
// sample catalogs (three fake reports, three fake blog posts, a permalink
// derived from the requested slug, an export that generated no document).
// Until report persistence and the blog CMS are real, every one of them
// returns 501 Not Implemented. A 501 tells the truth: the route exists, the
// capability does not. Nothing here invents data.

/** Shared 501 body so clients can branch on a stable `code`. */
function notImplemented(res: Response, capability: string, replacement?: string): void {
  res.status(501).json({
    success: false,
    code: 'NOT_IMPLEMENTED',
    error: `${capability} is not implemented on this deployment. This endpoint previously returned sample data instead of real records.`,
    ...(replacement ? { useInstead: replacement } : {}),
    timestamp: Date.now()
  });
}

export function registerReportRoutes(app: import('express').Express): void {

// 4. Reports & Dossiers
app.get('/api/v1/reports', (req: Request, res: Response) => {
  void req;
  notImplemented(
    res,
    'The audit report catalog',
    'POST /api/v1/audit/master/stream returns measured engine output for a target URL.'
  );
});

app.get('/api/v1/reports/permalink/:slug', (req: Request, res: Response) => {
  void req.params;
  notImplemented(res, 'Report permalinks');
});

app.post('/api/v1/reports/:id/export', (req: Request, res: Response) => {
  void req.params;
  void req.body;
  notImplemented(res, 'Report export');
});

// 5. Blogs API
app.get('/api/v1/blogs', (req: Request, res: Response) => {
  void req;
  notImplemented(res, 'The blogs API', 'Articles are read from Firestore by the client (getBlogPosts) and rendered at /blogs.');
});

app.get('/api/v1/blogs/:slug', (req: Request, res: Response) => {
  void req.params;
  notImplemented(res, 'The blogs API', 'Articles are read from Firestore by the client (getBlogPosts) and rendered at /blogs/:slug.');
});

}
