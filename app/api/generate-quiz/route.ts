import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { synthesis, instrumentName } = await req.json();

    const questions = [
      {
        title: `Which primary methodology or context of "${instrumentName || 'the research outline'}" was most emphasized in the synthesized literature?`,
        options: [
          "Optimizing multi-source sensor integration and calibration bounds",
          "Conducting long-term predictive analysis under strict environmental stressors",
          "Synthesizing alternate scenario guidelines and paradigm stress-tests"
        ]
      },
      {
        title: `How does the proposed research concept attempt to address the key limits identified in this academic evaluation?`,
        options: [
          "By establishing a dynamic feedback controller to prevent boundary failure",
          "By reverting to legacy baseline assumptions and subjective analysis",
          "By limiting applicability exclusively to low-pressure theoretical models"
        ]
      },
      {
        title: `Under the framework of "${instrumentName || 'this research design'}", what serves as the primary validation mechanism?`,
        options: [
          "Double-blind peer-reviewed methodology stress testing and control arrays",
          "Qualitative user feedback surveys compiled with manual tracking spreadsheet logs",
          "Direct comparison of theoretical citation index values and timeline milestones"
        ]
      }
    ];

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error('Quiz generation API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
