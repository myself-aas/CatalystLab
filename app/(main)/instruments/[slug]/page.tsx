'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, Loader2, BookOpen, ExternalLink, Zap, FlaskConical, Target, BrainCircuit, FileText, FileSpreadsheet, ClipboardList, Mail, Calendar, CheckSquare, Cpu, Sliders, ChevronDown, ChevronUp, Bot, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../../../lib/firebase';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { exportToGoogleDoc } from '../../../../lib/googleDocs';
import { exportToGoogleSheet } from '../../../../lib/googleSheets';
import { createAcademicQuizForm } from '../../../../lib/googleForms';
import { sendSynthesisEmail } from '../../../../lib/googleGmail';
import { scheduleResearchSession } from '../../../../lib/googleCalendar';
import { addTask } from '../../../../lib/googleTasks';
import { useAuth } from '../../../../components/AuthProvider';
import Markdown from 'react-markdown';
import { ThoughtColliderWorkspace } from '../../../../components/ThoughtColliderWorkspace';



export default function InstrumentRunPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [exporting, setExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState('');
  
  const [exportingSheet, setExportingSheet] = useState(false);
  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);
  const [exportSheetError, setExportSheetError] = useState('');

  const [exportingForm, setExportingForm] = useState(false);
  const [exportedFormUrl, setExportedFormUrl] = useState<string | null>(null);
  const [exportFormError, setExportFormError] = useState('');
  

  const [formProgress, setFormProgress] = useState('');
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [emailing, setEmailing] = useState(false);
  const [emailSentRecipient, setEmailSentRecipient] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const [scheduling, setScheduling] = useState(false);
  const [scheduledEventUrl, setScheduledEventUrl] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState('');
  const [calendarProgress, setCalendarProgress] = useState('');

  const [tasking, setTasking] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [taskError, setTaskError] = useState('');
  const [taskProgress, setTaskProgress] = useState('');

  const handleAddTask = async () => {
    if (!result || !result.tldr) return;
    setTasking(true);
    setTaskError('');
    setCreatedTaskId(null);
    setTaskProgress('Authorizing tasks...');
    try {
      const taskId = await addTask(slug.replace('-', ' '), result.tldr, (msg) => {
        setTaskProgress(msg);
      });
      setCreatedTaskId(taskId);

      if (currentSessionId) {
        try {
          await updateDoc(doc(db, 'sessions', currentSessionId), {
            googleTaskId: taskId
          });
        } catch (dbErr) {
          console.error('Failed to update session with Task ID:', dbErr);
          handleFirestoreError(dbErr, OperationType.UPDATE, `sessions/${currentSessionId}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setTaskError(err.message || 'Error creating task.');
    } finally {
      setTasking(false);
      setTaskProgress('');
    }
  };

  const handleExport = async () => {
    if (!result) return;
    setExporting(true);
    setExportError('');
    setExportedUrl(null);
    try {
      const url = await exportToGoogleDoc(result, slug.replace('-', ' '));
      setExportedUrl(url);

      if (currentSessionId) {
        try {
          await updateDoc(doc(db, 'sessions', currentSessionId), {
            googleDocUrl: url
          });
        } catch (dbErr) {
          console.error('Failed to update session with Google Doc URL:', dbErr);
          handleFirestoreError(dbErr, OperationType.UPDATE, `sessions/${currentSessionId}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to export to Google Docs:', err);
      setExportError(err.message || 'Error occurred during exporting. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSheet = async () => {
    if (!result || !result.papers || result.papers.length === 0) return;
    setExportingSheet(true);
    setExportSheetError('');
    setExportedSheetUrl(null);
    try {
      const url = await exportToGoogleSheet(result, slug.replace('-', ' '));
      setExportedSheetUrl(url);

      if (currentSessionId) {
        try {
          await updateDoc(doc(db, 'sessions', currentSessionId), {
            googleSheetUrl: url
          });
        } catch (dbErr) {
          console.error('Failed to update session with Google Sheet URL:', dbErr);
          handleFirestoreError(dbErr, OperationType.UPDATE, `sessions/${currentSessionId}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to export to Google Sheets:', err);
      setExportSheetError(err.message || 'Error occurred during exporting. Please try again.');
    } finally {
      setExportingSheet(false);
    }
  };

  const handleExportForm = async () => {
    if (!result || !result.synthesis) return;
    setExportingForm(true);
    setExportFormError('');
    setExportedFormUrl(null);
    setFormProgress('Initializing evaluation setup...');
    try {
      const url = await createAcademicQuizForm(result.synthesis, slug.replace('-', ' '), (msg) => {
        setFormProgress(msg);
      });
      setExportedFormUrl(url);

      if (currentSessionId) {
        try {
          await updateDoc(doc(db, 'sessions', currentSessionId), {
            googleFormUrl: url
          });
        } catch (dbErr) {
          console.error('Failed to update session with Google Form URL:', dbErr);
          handleFirestoreError(dbErr, OperationType.UPDATE, `sessions/${currentSessionId}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to export to Google Forms:', err);
      setExportFormError(err.message || 'Error occurred during dynamic questionnaire generation. Please try again.');
    } finally {
      setExportingForm(false);
      setFormProgress('');
    }
  };

  const handleSendEmail = async () => {
    if (!result || !emailInput.trim()) return;
    setEmailing(true);
    setEmailError('');
    setEmailSentRecipient(null);
    try {
      await sendSynthesisEmail(emailInput.trim(), result, slug.replace('-', ' '));
      setEmailSentRecipient(emailInput.trim());

      if (currentSessionId) {
        try {
          await updateDoc(doc(db, 'sessions', currentSessionId), {
            googleGmailRecipient: emailInput.trim()
          });
        } catch (dbErr) {
          console.error('Failed to update session with Gmail recipient:', dbErr);
          handleFirestoreError(dbErr, OperationType.UPDATE, `sessions/${currentSessionId}`);
        }
      }
      setEmailInput('');
      setShowEmailInput(false);
    } catch (err: any) {
      console.error('Failed to send synthesis email:', err);
      setEmailError(err.message || 'Error occurred during sending email. Please try again.');
    } finally {
      setEmailing(false);
    }
  };

  const handleScheduleCalendar = async () => {
    if (!result || !result.synthesis) return;
    setScheduling(true);
    setScheduleError('');
    setScheduledEventUrl(null);
    setCalendarProgress('Authorizing calendar...');
    try {
      const url = await scheduleResearchSession(slug.replace('-', ' '), new Date().toISOString(), (msg) => {
        setCalendarProgress(msg);
      });
      setScheduledEventUrl(url);

      if (currentSessionId) {
        try {
          await updateDoc(doc(db, 'sessions', currentSessionId), {
            googleCalendarEventUrl: url
          });
        } catch (dbErr) {
          console.error('Failed to update session with Calendar URL:', dbErr);
          handleFirestoreError(dbErr, OperationType.UPDATE, `sessions/${currentSessionId}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to schedule calendar event:', err);
      setScheduleError(err.message || 'Error scheduling calendar event.');
    } finally {
      setScheduling(false);
      setCalendarProgress('');
    }
  };

  const handleCollideAndRun = async (serializedInput: string) => {
    if (!user) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: serializedInput,
          slug: slug.replace('-', ' '),
          modelSettings: {
            engine: 'auto'
          }
        })
      });

      if (!res.ok) {
        throw new Error('Failed to run synthesis');
      }

      const data = await res.json();
      setResult(data);
      setInput(serializedInput);
      
      try {
        const docRef = await addDoc(collection(db, 'sessions'), {
          uid: user.uid,
          title: slug.replace('-', ' '),
          duration: 0,
          instrumentName: slug.replace('-', ' '),
          input: serializedInput,
          output: data.synthesis || '',
          tldr: data.tldr || '',
          noveltyScore: data.noveltyScore || 0,
          createdAt: new Date()
        });
        setCurrentSessionId(docRef.id);
      } catch (err) {
        console.error('Failed to log session:', err);
        handleFirestoreError(err, OperationType.CREATE, 'sessions');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during synthesis');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!input.trim() || !user) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input,
          slug: slug.replace('-', ' '),
          modelSettings: {
            engine: 'auto'
          }
        })
      });

      if (!res.ok) {
        throw new Error('Failed to run synthesis');
      }

      const data = await res.json();
      setResult(data);
      
      try {
        const docRef = await addDoc(collection(db, 'sessions'), {
          uid: user.uid,
          title: slug.replace('-', ' '),
          duration: 0,
          instrumentName: slug.replace('-', ' '),
          input,
          output: data.synthesis || '',
          tldr: data.tldr || '',
          noveltyScore: data.noveltyScore || 0,
          createdAt: new Date()
        });
        setCurrentSessionId(docRef.id);
      } catch (err) {
        console.error('Failed to log session:', err);
        handleFirestoreError(err, OperationType.CREATE, 'sessions');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during synthesis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 overflow-hidden max-h-[calc(100vh-8rem)]">
      
      {/* Panel 1: Input */}
      <div className="w-full xl:w-1/4 shrink-0 flex flex-col bg-white border border-[#68BA7F]/30 rounded-[1.5rem] overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#68BA7F]/30 bg-[#F4F9F5] flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#2E6F40]" />
          <h2 className="font-bold text-[#253D2C] uppercase text-sm tracking-widest truncate">{slug.replace('-', ' ')}</h2>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          {slug === 'thought-collider' ? (
            <div className="flex flex-col h-full space-y-4">
              <ThoughtColliderWorkspace 
                onCollide={(serialized) => handleCollideAndRun(serialized)}
                loading={loading}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#253D2C]/80">Research Input</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-48 md:h-64 p-4 rounded-[1.25rem] bg-white border border-[#68BA7F]/40 text-[#253D2C] placeholder:text-[#2E6F40]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm leading-relaxed shadow-lg"
                  placeholder="Type your hypothesis, concept, or problem statement here..."
                ></textarea>
              </div>
              
              <button
                onClick={handleRun}
                disabled={loading || !input.trim()}
                className="w-full py-3.5 bg-[#2E6F40] hover:bg-[#253D2C] text-[#FFFFFF] font-bold rounded-[1.25rem] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-auto"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? 'Synthesizing...' : 'Run Instrument'}
              </button>
            </>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-[1.25rem] text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Panel 2: Output & Analytics */}
      <div className="w-full xl:w-2/4 flex flex-col bg-white border border-[#68BA7F]/30 rounded-[1.5rem] overflow-hidden min-h-[400px] shadow-lg">
        <div className="p-4 border-b border-[#68BA7F]/30 bg-[#F4F9F5] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#2E6F40]" />
            <h2 className="font-bold text-[#253D2C] uppercase text-sm tracking-widest">Synthesis Engine</h2>
          </div>
          {result && !loading && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {/* Google Doc Export Button */}
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#68BA7F]/40 bg-white text-xs font-bold text-[#2E6F40] hover:bg-[#F4F9F5] hover:text-[#253D2C] transition-all duration-200 disabled:opacity-50 shadow-md shrink-0 animate-in fade-in"
                title="Export this synthesis report directly to Google Docs"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Exporting Doc...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export to Google Doc</span>
                  </>
                )}
              </button>

               {/* Google Sheets Export Button */}
              {result.papers && result.papers.length > 0 && (
                <button
                  onClick={handleExportSheet}
                  disabled={exportingSheet}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#68BA7F]/40 bg-white text-xs font-bold text-[#2E6F40] hover:bg-[#F4F9F5] hover:text-[#253D2C] transition-all duration-200 disabled:opacity-50 shadow-md shrink-0 animate-in fade-in"
                  title="Export reference publications directly to Google Sheets database"
                >
                  {exportingSheet ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting Sheet...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export to Google Sheet</span>
                    </>
                  )}
                </button>
              )}

              {/* Google Form Export Button */}
              {result && (
                <button
                  onClick={handleExportForm}
                  disabled={exportingForm}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#68BA7F]/40 bg-white text-xs font-bold text-[#2E6F40] hover:bg-[#F4F9F5] hover:text-[#253D2C] transition-all duration-200 disabled:opacity-50 shadow-md shrink-0 animate-in fade-in"
                  title="Generate dynamic peer evaluation questionnaire on Google Forms"
                >
                  {exportingForm ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="max-w-[120px] truncate">{formProgress || 'Generating Form...'}</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Export Peer Review Form</span>
                    </>
                  )}
                </button>
              )}

              {/* Share via Gmail Button */}
              {result && (
                <div className="relative inline-block z-30">
                  <button
                    onClick={() => setShowEmailInput(!showEmailInput)}
                    disabled={emailing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#68BA7F]/40 bg-white text-xs font-bold text-[#2E6F40] hover:bg-[#F4F9F5] hover:text-[#253D2C] transition-all duration-200 disabled:opacity-50 shadow-md shrink-0 animate-in fade-in"
                    title="Send this synthesis report directly to a peer via Google Gmail"
                  >
                    {emailing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Share via Email</span>
                      </>
                    )}
                  </button>

                  {showEmailInput && (
                    <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-[#68BA7F]/40 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                      <p className="font-bold text-[#253D2C] text-xs mb-2">Email Research Findings (Gmail)</p>
                      <div className="space-y-3">
                        <input
                          type="email"
                          placeholder="academic-peer@university.edu"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs text-[#253D2C] border border-[#68BA7F]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E6F40] bg-[#F4F9F5]/40"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setShowEmailInput(false);
                              setEmailInput('');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-[#2E6F40]/70 hover:bg-[#F4F9F5] rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendEmail}
                            disabled={!emailInput.trim() || emailing}
                            className="px-3 py-1 text-[11px] bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Schedule Google Calendar Event Button */}
              {result && (
                <button
                  onClick={handleScheduleCalendar}
                  disabled={scheduling}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#68BA7F]/40 bg-white text-xs font-bold text-[#2E6F40] hover:bg-[#F4F9F5] hover:text-[#253D2C] transition-all duration-200 disabled:opacity-50 shadow-md shrink-0 animate-in fade-in"
                  title="Schedule a research session in Google Calendar"
                >
                  {scheduling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="max-w-[120px] truncate">{calendarProgress || 'Scheduling...'}</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Session</span>
                    </>
                  )}
                </button>
              )}

              {/* Add Google Task Button */}
              {result && (
                <button
                  onClick={handleAddTask}
                  disabled={tasking}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#68BA7F]/40 bg-white text-xs font-bold text-[#2E6F40] hover:bg-[#F4F9F5] hover:text-[#253D2C] transition-all duration-200 disabled:opacity-50 shadow-md shrink-0 animate-in fade-in"
                  title="Create a research follow-up task in Google Tasks"
                >
                  {tasking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="max-w-[120px] truncate">{taskProgress || 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-[#253D2C]/80">
          {/* Google Docs Export Status Notifications */}
          {exportedUrl && (
            <div className="p-4 bg-[#CFFFDC]/95 border border-[#68BA7F] rounded-[1.25rem] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-[#253D2C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] inline-block animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-[#2E6F40]">Export Successful!</span> Your synthesis report is now on Google Docs.
                </div>
              </div>
              <a 
                href={exportedUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setExportedUrl(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow"
              >
                Open Google Doc <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {exportError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-[1.25rem] text-sm flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <span>{exportError}</span>
              <button 
                onClick={() => setExportError('')}
                className="text-xs underline text-red-700 hover:text-red-900 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Google Sheets Export Status Notifications */}
          {exportedSheetUrl && (
            <div className="p-4 bg-[#CFFFDC]/95 border border-[#68BA7F] rounded-[1.25rem] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-[#253D2C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] inline-block animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-[#2E6F40]">Map Export Successful!</span> Your mapped literature reference database is on Google Sheets.
                </div>
              </div>
              <a 
                href={exportedSheetUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setExportedSheetUrl(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow"
              >
                Open Google Sheet <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {exportSheetError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-[1.25rem] text-sm flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <span>{exportSheetError}</span>
              <button 
                onClick={() => setExportSheetError('')}
                className="text-xs underline text-red-700 hover:text-red-900 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Google Forms Export Status Notifications */}
          {exportedFormUrl && (
            <div className="p-4 bg-[#CFFFDC]/95 border border-[#68BA7F] rounded-[1.25rem] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-[#253D2C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] inline-block animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-[#2E6F40]">Form Successfully Generated!</span> Your custom peer evaluation and review questionnaire is ready on Google Forms.
                </div>
              </div>
              <a 
                href={exportedFormUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setExportedFormUrl(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow"
              >
                Open Google Form <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {exportFormError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-[1.25rem] text-sm flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <span>{exportFormError}</span>
              <button 
                onClick={() => setExportFormError('')}
                className="text-xs underline text-red-700 hover:text-red-900 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Gmail Dispatch Status Notifications */}
          {emailSentRecipient && (
            <div className="p-4 bg-[#CFFFDC]/95 border border-[#68BA7F] rounded-[1.25rem] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-[#253D2C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] inline-block animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-[#2E6F40]">Email Dispatched Successfully!</span> The academic synthesis has been sent to <span className="font-mono text-[#2E6F40] bg-white/60 px-1.5 py-0.5 rounded border border-[#68BA7F]/20">{emailSentRecipient}</span>.
                </div>
              </div>
              <button 
                onClick={() => setEmailSentRecipient(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow"
              >
                Dismiss
              </button>
            </div>
          )}

          {emailError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-[1.25rem] text-sm flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <span>{emailError}</span>
              <button 
                onClick={() => setEmailError('')}
                className="text-xs underline text-red-700 hover:text-red-900 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Calendar Scheduling Status Notifications */}
          {scheduledEventUrl && (
            <div className="p-4 bg-[#CFFFDC]/95 border border-[#68BA7F] rounded-[1.25rem] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-[#253D2C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] inline-block animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-[#2E6F40]">Session Scheduled Successfully!</span> Research study session added to your primary Google Calendar.
                </div>
              </div>
              <a 
                href={scheduledEventUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setScheduledEventUrl(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow"
              >
                Open Calendar Event <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {scheduleError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-[1.25rem] text-sm flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <span>{scheduleError}</span>
              <button 
                onClick={() => setScheduleError('')}
                className="text-xs underline text-red-700 hover:text-red-900 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Tasks Notification */}
          {createdTaskId && (
            <div className="p-4 bg-[#CFFFDC]/95 border border-[#68BA7F] rounded-[1.25rem] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-[#253D2C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] inline-block animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-[#2E6F40]">Task Created Successfully!</span> Research action item added to your Google Tasks.
                </div>
              </div>
              <button 
                onClick={() => setCreatedTaskId(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow"
              >
                Dismiss
              </button>
            </div>
          )}

          {taskError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-[1.25rem] text-sm flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <span>{taskError}</span>
              <button 
                onClick={() => setTaskError('')}
                className="text-xs underline text-red-700 hover:text-red-900 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}
          {loading ? (
              <div className="flex flex-col text-[#2E6F40] gap-6 p-6 max-w-3xl border-t border-transparent mt-12 w-full mx-auto">
                <div className="flex flex-col items-center justify-center gap-4 py-8 animate-pulse text-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <div className="text-sm font-mono tracking-widest uppercase">Connecting to global APIs & Synthesizing...</div>
                </div>
                
                {/* Visual Feedback Skeleton Loaders */}
                <div className="space-y-6 w-full opacity-50">
                  {/* Skeleton Header */}
                  <div className="space-y-4">
                    <div className="h-8 bg-[#68BA7F]/20 rounded-md w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-[#68BA7F]/10 rounded w-1/2 animate-pulse"></div>
                  </div>
                  
                  {/* Skeleton Paragraphs */}
                  <div className="space-y-5 pt-6 border-t border-[#68BA7F]/10">
                    <div className="space-y-3">
                       <div className="h-4 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
                       <div className="h-4 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
                       <div className="h-4 bg-[#68BA7F]/10 rounded w-5/6 animate-pulse"></div>
                    </div>
                    <div className="space-y-3 pt-2">
                       <div className="h-4 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
                       <div className="h-4 bg-[#68BA7F]/10 rounded w-4/5 animate-pulse"></div>
                       <div className="h-4 bg-[#68BA7F]/10 rounded w-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Top Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#F4F9F5] border border-[#68BA7F]/30 p-4 rounded-[1.25rem] flex flex-col gap-2">
                  <div className="text-xs font-bold text-[#2E6F40]/80 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#2E6F40]" /> Novelty Score
                  </div>
                  <div className="text-3xl font-bold text-[#253D2C] flex items-baseline gap-1">
                    {result.noveltyScore} <span className="text-sm text-[#2E6F40]/70 font-normal">/ 100</span>
                  </div>
                  <div className="w-full bg-[#CFFFDC] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${result.noveltyScore > 80 ? 'bg-[#2E6F40]' : result.noveltyScore > 50 ? 'bg-[#68BA7F]' : 'bg-[#68BA7F]/40'}`} 
                      style={{ width: `${result.noveltyScore}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-[#F4F9F5] border border-[#68BA7F]/30 p-4 rounded-[1.25rem] flex flex-col gap-2 md:col-span-2">
                  <div className="text-xs font-bold text-[#2E6F40]/80 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#2E6F40]" /> Discipline Focus
                  </div>
                  <div className="text-sm text-[#253D2C]/80 font-mono flex flex-wrap gap-2 mt-1">
                    {result.speciality?.split(',').slice(0, 4).map((spec: string, i: number) => (
                      <span key={i} className="bg-[#CFFFDC] text-[#2E6F40] border border-[#68BA7F]/50 px-2 py-1 rounded text-xs">
                        {spec.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* TLDR */}
              <div className="px-5 py-4 bg-[#CFFFDC]/40 border border-[#68BA7F]/30 rounded-[1.25rem] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#68BA7F]" />
                <h3 className="text-xs font-bold text-[#2E6F40] uppercase tracking-widest mb-2">Executive TL;DR</h3>
                <p className="text-sm text-[#253D2C]/80 leading-relaxed">
                  {result.tldr}
                </p>
              </div>

              {/* Markdown Synthesis */}
              <div className="prose prose-indigo max-w-none prose-sm sm:prose-base prose-headings:font-bold prose-headings:text-[#253D2C] prose-p:leading-relaxed prose-p:text-[#253D2C]/80">
                <Markdown>{result.synthesis}</Markdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#2E6F40]/70 text-center italic space-y-4">
              <BrainCircuit className="w-12 h-12 text-[#2E6F40]/30" />
              <p>Awaiting input to begin real-time data extraction and synthesis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel 3: Literature */}
      <div className="w-full xl:w-1/4 shrink-0 flex flex-col bg-white border border-[#68BA7F]/30 rounded-[1.5rem] overflow-hidden min-h-[400px] shadow-lg">
        <div className="p-4 border-b border-[#68BA7F]/30 bg-[#F4F9F5] flex items-center justify-between">
          <h2 className="font-bold text-[#253D2C] uppercase text-sm tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2E6F40]" /> Discovery
          </h2>
          {result && (
            <span className="text-[10px] bg-[#CFFFDC] text-[#2E6F40] px-2 py-1 rounded-full font-bold tracking-wider">
              {result.papers?.length || 0} SOURCES
            </span>
          )}
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex flex-col h-full gap-4 pt-8">
              <div className="flex flex-col items-center justify-center text-[#2E6F40] gap-3 pb-4 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin" />
                <div className="text-xs font-mono tracking-wider text-center px-4 leading-relaxed">
                  Querying arXiv, PubMed, OpenAlex, Crossref, Zenodo, DataCite, Semantic Scholar, Figshare, HDX, OpenAIRE, NASA ADS, Exa, Tavily...
                </div>
              </div>
              
              {/* Paper Skeleton List */}
              <div className="space-y-4 opacity-60 px-2 mt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-[1.25rem] bg-white border border-[#68BA7F]/20 animate-pulse space-y-3 shadow-sm">
                    <div className="h-4 bg-[#68BA7F]/20 rounded-md w-5/6"></div>
                    <div className="h-3 bg-[#68BA7F]/10 rounded w-full"></div>
                    <div className="flex gap-2 pt-2">
                       <div className="h-3 bg-[#68BA7F]/20 rounded-full w-16"></div>
                       <div className="h-3 bg-[#68BA7F]/20 rounded-full w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : result?.papers?.length > 0 ? (
            result.papers.map((lit: any, idx: number) => (
              <div key={lit.id || idx} className="p-3.5 rounded-[1.25rem] bg-[#F4F9F5] border border-[#68BA7F]/30 hover:border-[#68BA7F]/40 transition-colors space-y-3 group shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-[#253D2C] leading-snug group-hover:text-[#2E6F40] transition-colors line-clamp-3">
                    [{idx+1}] {lit.title}
                  </h3>
                  {lit.url && (
                    <a href={lit.url} target="_blank" rel="noreferrer" className="text-[#2E6F40]/60 hover:text-[#2E6F40] transition-colors shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-[#2E6F40]/80 line-clamp-2 leading-relaxed">{lit.authors}</p>
                
                <div className="flex items-center justify-between pt-2 border-t border-[#68BA7F]/30">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#2E6F40]/70">
                    <span className="bg-white p-1 rounded border border-[#68BA7F]/30">{lit.year || 'N/A'}</span>
                    <span className="bg-white p-1 rounded text-[#2E6F40] border border-[#68BA7F]/30">{lit.source}</span>
                  </div>
                  {lit.citationCount > 0 && (
                    <span className="text-[10px] font-mono text-[#2E6F40] bg-[#CFFFDC] px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                      {lit.citationCount} Cites
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-[#2E6F40]/70 text-center text-sm italic px-4">
              Academic literature mapping will appear here simultaneously.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

