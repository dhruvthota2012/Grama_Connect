import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import {
  getSpeechDiagnostics,
  subscribeDiagnostics,
  testSpeechPhrase,
  SpeechDiagnostics,
  TestPhraseResult,
} from '../utils/speechGuidance';
import { Activity, Play, CheckCircle2, AlertCircle, RefreshCw, ChevronUp, ChevronDown, Radio } from 'lucide-react';

export const VoiceDiagnosticPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [diagnostics, setDiagnostics] = useState<SpeechDiagnostics>(() => getSpeechDiagnostics());
  const [testResult, setTestResult] = useState<TestPhraseResult | null>(null);
  const [activeTestLang, setActiveTestLang] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeDiagnostics((d) => {
      setDiagnostics({ ...d });
    });
    return unsubscribe;
  }, []);

  const runTest = async (lang: Language) => {
    setActiveTestLang(lang);
    setIsLoading(true);
    setTestResult(null);

    try {
      const res = await testSpeechPhrase(lang);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        language: lang,
        phrase: lang === 'te' ? 'గ్రామ కనెక్ట్కు స్వాగతం.' : lang === 'hi' ? 'ग्राम कनेक्ट में आपका स्वागत है।' : 'Welcome to GramaConnect.',
        engine: 'Unknown',
        voice: 'Unknown',
        source: 'none',
        error: err?.message || 'Playback failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="voice-diagnostic-panel" aria-label="Speech System Diagnostics">
      {/* Toggle Bar */}
      <div className="diagnostic-header-bar" onClick={() => setIsOpen(!isOpen)}>
        <div className="diag-title-group">
          <Activity size={18} className="diag-icon" />
          <span className="diag-title">
            <strong>VOICE ENGINE DIAGNOSTIC & TEST BENCH</strong>
            <span className="diag-pill">
              Telugu Voice: {diagnostics.hasTeluguVoice ? 'Browser Installed' : 'Fallback Active (Pre-recorded / Cloud)'}
            </span>
          </span>
        </div>
        <div className="diag-toggle-btn">
          <span>{isOpen ? 'COLLAPSE' : 'EXPAND'}</span>
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="diagnostic-body">
          {/* Status Matrix */}
          <div className="status-matrix-grid">
            {/* Telugu Column */}
            <div className={`status-col ${diagnostics.hasTeluguVoice ? 'has-voice' : 'fallback-mode'}`}>
              <div className="col-header">
                <span className="lang-tag">తెలుగు (Telugu - te-IN)</span>
                <span className="engine-badge">
                  {diagnostics.hasTeluguVoice ? 'Browser TTS' : 'Pre-recorded / Cloud Fallback'}
                </span>
              </div>
              <div className="col-info">
                <div className="info-row">
                  <span className="info-k">Browser Voice:</span>
                  <span className="info-v">
                    {diagnostics.hasTeluguVoice
                      ? diagnostics.availableVoices.te[0]
                      : 'None (Prevented silent English fallback)'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-k">Fallback Engine:</span>
                  <span className="info-v">Local Pre-Recorded Audio + /api/tts</span>
                </div>
                <div className="info-row">
                  <span className="info-k">Official Cloud Voice:</span>
                  <span className="info-v font-mono">te-IN-Standard-A (Female)</span>
                </div>
              </div>
            </div>

            {/* Hindi Column */}
            <div className={`status-col ${diagnostics.hasHindiVoice ? 'has-voice' : 'fallback-mode'}`}>
              <div className="col-header">
                <span className="lang-tag">हिन्दी (Hindi - hi-IN)</span>
                <span className="engine-badge">
                  {diagnostics.hasHindiVoice ? 'Browser TTS' : 'Pre-recorded / Cloud Fallback'}
                </span>
              </div>
              <div className="col-info">
                <div className="info-row">
                  <span className="info-k">Browser Voice:</span>
                  <span className="info-v">
                    {diagnostics.hasHindiVoice
                      ? diagnostics.availableVoices.hi[0]
                      : 'None in OS (Using Fallback)'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-k">Official Cloud Voice:</span>
                  <span className="info-v font-mono">hi-IN-Standard-A (Female)</span>
                </div>
              </div>
            </div>

            {/* English Column */}
            <div className={`status-col ${diagnostics.hasEnglishVoice ? 'has-voice' : 'fallback-mode'}`}>
              <div className="col-header">
                <span className="lang-tag">English (en-IN)</span>
                <span className="engine-badge">
                  {diagnostics.hasEnglishVoice ? 'Browser TTS' : 'Pre-recorded / Cloud Fallback'}
                </span>
              </div>
              <div className="col-info">
                <div className="info-row">
                  <span className="info-k">Browser Voice:</span>
                  <span className="info-v">
                    {diagnostics.hasEnglishVoice
                      ? diagnostics.availableVoices.en[0]
                      : 'Default System Voice'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-k">Official Cloud Voice:</span>
                  <span className="info-v font-mono">en-IN-Standard-A (Female)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cloud API Key Diagnostic Note */}
          <div className="cloud-key-diagnostic-row">
            <Radio size={16} />
            <span>
              Server Cloud TTS Status: <strong>{diagnostics.serverTtsStatus.apiKeyConfigured ? 'GOOGLE CLOUD API KEY ACTIVE' : 'PRE-RECORDED ASSETS + STREAM PROXY ACTIVE (Development Mode)'}</strong>
            </span>
          </div>

          {/* Three Test Buttons as required */}
          <div className="test-buttons-section">
            <span className="test-section-label">Interactive Voice Output Verification:</span>
            <div className="test-buttons-row">
              {/* Button 1: Test English */}
              <button
                type="button"
                className={`diag-test-btn ${activeTestLang === 'en' ? 'testing' : ''}`}
                onClick={() => runTest('en')}
                disabled={isLoading}
              >
                <Play size={18} />
                <div className="btn-txt-block">
                  <span className="btn-main">Test English</span>
                  <span className="btn-quote">“Welcome to GramaConnect.”</span>
                </div>
              </button>

              {/* Button 2: Test Telugu */}
              <button
                type="button"
                className={`diag-test-btn te-btn ${activeTestLang === 'te' ? 'testing' : ''}`}
                onClick={() => runTest('te')}
                disabled={isLoading}
              >
                <Play size={18} />
                <div className="btn-txt-block">
                  <span className="btn-main">Test Telugu (తెలుగు)</span>
                  <span className="btn-quote">“గ్రామ కనెక్ట్కు స్వాగతం.”</span>
                </div>
              </button>

              {/* Button 3: Test Hindi */}
              <button
                type="button"
                className={`diag-test-btn ${activeTestLang === 'hi' ? 'testing' : ''}`}
                onClick={() => runTest('hi')}
                disabled={isLoading}
              >
                <Play size={18} />
                <div className="btn-txt-block">
                  <span className="btn-main">Test Hindi (हिन्दी)</span>
                  <span className="btn-quote">“ग्राम कनेक्ट में आपका स्वागत है।”</span>
                </div>
              </button>
            </div>
          </div>

          {/* Test Execution Output Box */}
          {isLoading && (
            <div className="test-exec-output loading">
              <RefreshCw size={18} className="spin-anim" />
              <span>Synthesizing and playing speech audio...</span>
            </div>
          )}

          {testResult && !isLoading && (
            <div className={`test-exec-output ${testResult.success ? 'success' : 'failure'}`}>
              <div className="result-header">
                {testResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <strong>
                  {testResult.success
                    ? `PLAYBACK SUCCESSFUL (${testResult.language.toUpperCase()})`
                    : `PLAYBACK FAILED (${testResult.language.toUpperCase()})`}
                </strong>
              </div>
              <div className="result-details-grid">
                <div>
                  <span className="detail-k">Spoken Phrase:</span>
                  <span className="detail-v">“{testResult.phrase}”</span>
                </div>
                <div>
                  <span className="detail-k">Active Speech Engine:</span>
                  <span className="detail-v font-bold">{testResult.engine}</span>
                </div>
                <div>
                  <span className="detail-k">Resolved Voice:</span>
                  <span className="detail-v font-bold">{testResult.voice}</span>
                </div>
                <div>
                  <span className="detail-k">Engine Source:</span>
                  <span className="detail-v">{testResult.source}</span>
                </div>
              </div>
              {testResult.error && (
                <div className="result-error-box">
                  <strong>Error details:</strong> {testResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
