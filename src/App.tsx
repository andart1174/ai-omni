import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, Mic, Settings, Sparkles, Download,
  Trash2, Video, Image as ImageIcon, Printer,
  Music, ShieldCheck, Wand2, Database, Code2, Layout, Plus, Copy, Check,
  Box, WandSparkles, QrCode, Files, Globe
} from 'lucide-react';
import { convertImage } from './engine/mediaEngine';
import type { SupportedFormat } from './engine/mediaEngine';
import { convertVideo } from './engine/videoEngine';
import type { VideoFormat } from './engine/videoEngine';
import { voiceEngine } from './engine/voiceEngine';
import { convertToPrint } from './engine/printEngine';
import type { PrintFormat } from './engine/printEngine';
import { convertAudio, editAudioMetadata } from './engine/audioEngine';
import type { AudioFormat } from './engine/audioEngine';
import { stripExif, applyWatermark } from './engine/securityEngine';
import { removeBackground, upscaleImage } from './engine/aiEngine';
import { extractTextOCR, exportToExcel, createSignatureOverlay } from './engine/dataEngine';
import * as threeD from './engine/threeDEngine';
import * as magic from './engine/magicEngine';
import * as brand from './engine/brandEngine';
import * as doc from './engine/documentEngine';
import * as web from './engine/webEngine';
import * as mockup from './engine/mockupEngine';
import * as social from './engine/socialEngine';
import * as analytics from './engine/analyticsEngine';
import * as cyber from './engine/cyberEngine';
import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ThreeDViewer = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const loader = new STLLoader();
    loader.load(url, (geometry) => {
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({
        color: 0x007aff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x001133
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Better centering logic
      geometry.computeBoundingBox();
      const offset = new THREE.Vector3();
      geometry.boundingBox!.getCenter(offset);
      mesh.position.set(-offset.x, -offset.y, -offset.z);

      scene.add(mesh);
      camera.position.set(20, 20, 30);
      controls.target.set(0, 0, 0);
      controls.update();

      const animate = () => {
        requestAnimationFrame(animate);
        mesh.rotation.z += 0.005;
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    });

    // Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x007aff, 2);
    blueLight.position.set(-15, -15, 15);
    scene.add(blueLight);

    const rimLight = new THREE.PointLight(0xffffff, 1);
    rimLight.position.set(0, 0, -20);
    scene.add(rimLight);

    return () => {
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [url]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px', cursor: 'grab' }} />;
};

interface ProcessedFile {
  id: string;
  originalName: string;
  originalUrl?: string;
  originalFile?: File; // Store original file for re-processing
  resultUrl: string;
  format: string;
  mimeType?: string;
}

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<any>('webp');
  const [activeFile, setActiveFile] = useState<ProcessedFile | null>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'video' | 'viral' | 'print' | 'audio' | 'security' | 'ai' | 'data' | 'dev' | 'design' | 'threeD' | 'magic' | 'brand' | 'document' | 'web' | 'mockup' | 'social' | 'analytics' | 'cyber'>('media');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threeDSettings, setThreeDSettings] = useState<threeD.ThreeDSettings>({ zScale: 4, res: 100, invert: false });
  const [webUrl, setWebUrl] = useState('https://google.com');
  const [analyticsCsv, setAnalyticsCsv] = useState('January,40\nFebruary,80\nMarch,60\nApril,120');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Design Studio State
  const [canvasComponents, setCanvasComponents] = useState<any[]>([]);
  const [generatedCode, setGeneratedCode] = useState('// Select components to start building...');
  const [copying, setCopying] = useState(false);

  // Update generated code when components change
  React.useEffect(() => {
    const updateCode = async () => {
      if (canvasComponents.length > 0) {
        const designMod = await import('./engine/designEngine');
        setGeneratedCode(designMod.generateReactCode(canvasComponents));
      } else {
        setGeneratedCode('// Select components to start building...');
      }
    };
    updateCode();
  }, [canvasComponents]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setIsProcessing(true);
    setError(null);
    setActiveFile(null);
    const newProcessedFiles: ProcessedFile[] = [];

    for (const file of Array.from(files)) {
      try {
        let resultUrl = '';
        if (activeTab === 'video' || activeTab === 'viral') {
          setError('🔄 Initializing Video Engine...');
          resultUrl = await convertVideo(file, selectedFormat as VideoFormat, (p) => {
            setConversionProgress(p);
            setError(null);
          });
        } else if (activeTab === 'print') {
          resultUrl = await convertToPrint(file, selectedFormat as PrintFormat);
        } else if (activeTab === 'audio') {
          if (selectedFormat === 'meta-edit') {
            resultUrl = await editAudioMetadata(file, { title: "Masterpiece", artist: "OmniConvert Artist" });
          } else {
            resultUrl = await convertAudio(file, selectedFormat as AudioFormat);
          }
        } else if (activeTab === 'security') {
          if (selectedFormat === 'strip') resultUrl = await stripExif(file);
          else resultUrl = await applyWatermark(file, "OMNICONVERT SECURE");
        } else if (activeTab === 'ai') {
          if (selectedFormat === 'bg-remove') resultUrl = await removeBackground(file);
          else resultUrl = await upscaleImage(file, 2);
        } else if (activeTab === 'threeD') {
          if (selectedFormat === 'stl-gen') resultUrl = await threeD.imageTo3D(file, threeDSettings);
          else resultUrl = await threeD.generateOBJ(file, threeDSettings);
        } else if (activeTab === 'magic') {
          if (selectedFormat === 'colorize') resultUrl = await magic.colorizeImage(file);
          else if (selectedFormat === 'denoise') resultUrl = await magic.denoiseImage(file);
          else resultUrl = await magic.restoreImage(file);
        } else if (activeTab === 'brand') {
          if (selectedFormat === 'qr-art') resultUrl = await brand.generateArtisticQR("https://omniconvert.app");
          else {
            const colors = await brand.extractPalette(file);
            resultUrl = URL.createObjectURL(new Blob([colors.join('\n')], { type: 'text/plain' }));
          }
        } else if (activeTab === 'document') {
          if (selectedFormat === 'pdf-merge') resultUrl = await doc.mergePDFs(Array.from(files));
          else resultUrl = await doc.docToMarkdown(file);
        } else if (activeTab === 'web') {
          resultUrl = await web.captureWebPage(webUrl);
        } else if (activeTab === 'mockup') {
          resultUrl = await mockup.generateMockup(file, selectedFormat as any);
        } else if (activeTab === 'social') {
          resultUrl = await social.applySocialVibe(file, selectedFormat as any);
        } else if (activeTab === 'analytics') {
          resultUrl = await analytics.renderCsvChart(analyticsCsv);
        } else if (activeTab === 'cyber') {
          if (selectedFormat === 'ascii') {
            const ascii = await cyber.imageToAscii(file);
            resultUrl = URL.createObjectURL(new Blob([ascii], { type: 'text/plain' }));
          } else {
            const hash = await cyber.generateHash(file.name);
            resultUrl = URL.createObjectURL(new Blob([hash], { type: 'text/plain' }));
          }
        } else if (activeTab === 'dev') {
          const devMod = await import('./engine/devEngine');
          resultUrl = await devMod.transformData(file, selectedFormat);
        } else if (activeTab === 'data') {
          if (selectedFormat === 'ocr') {
            const text = await extractTextOCR(file);
            resultUrl = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
          } else if (selectedFormat === 'sign-doc') {
            const sigCanvas = document.createElement('canvas');
            sigCanvas.width = 200; sigCanvas.height = 100;
            const sctx = sigCanvas.getContext('2d')!;
            sctx.font = '30px cursive'; sctx.fillStyle = 'blue';
            sctx.fillText('OmniSign', 10, 60);
            resultUrl = await createSignatureOverlay(file, sigCanvas.toDataURL());
          } else {
            resultUrl = await exportToExcel([{ name: file.name, size: file.size, type: file.type }]);
          }
        } else {
          resultUrl = await convertImage(file, { format: selectedFormat as SupportedFormat, quality: 0.9 });
        }

        const getMimeType = (format: string, tab: string) => {
          if (tab === 'video' || tab === 'viral') {
            if (format === 'mp3') return 'audio/mpeg';
            if (format === 'gif') return 'image/gif';
            if (format === 'webm') return 'video/webm';
            return 'video/mp4';
          }
          if (tab === 'audio') {
            if (format === 'wav') return 'audio/wav';
            if (format === 'flac') return 'audio/flac';
            return 'audio/mpeg';
          }
          if (tab === 'ai' || tab === 'media' || tab === 'security' || tab === 'magic' || tab === 'threeD' || tab === 'web') {
            if (format === 'pdf') return 'application/pdf';
            if (format === 'svg') return 'image/svg+xml';
            if (format === 'ico') return 'image/x-icon';
            if (format === 'stl-gen') return 'model/stl';
            if (format === 'obj-export') return 'model/obj';
            if (format === 'colorize' || format === 'denoise' || tab === 'web') return 'image/png';
            return 'image/jpeg';
          }
          if (tab === 'brand') return 'text/plain';
          if (tab === 'cyber' || tab === 'analytics' || tab === 'mockup' || tab === 'social') return 'image/png';
          if (tab === 'data' && format === 'ocr') return 'text/plain';
          if (tab === 'dev' && format !== 'base64') return 'text/plain';
          if (tab === 'document') {
            if (format === 'pdf-merge') return 'application/pdf';
            return 'text/plain';
          }
          if (tab === 'print') return 'application/pdf';
          return undefined;
        };

        newProcessedFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          originalName: file.name,
          originalUrl: URL.createObjectURL(file),
          originalFile: file,
          resultUrl,
          format: selectedFormat,
          mimeType: getMimeType(selectedFormat, activeTab)
        });
      } catch (err: any) {
        console.error('Conversion failed', err);
        setError(err.message || 'Unknown error occurred.');
      }
    }

    setIsProcessing(false);
    setConversionProgress(0);
    if (newProcessedFiles[0]) setActiveFile(newProcessedFiles[0]);
    setProcessedFiles(prev => [...newProcessedFiles, ...prev]);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#007aff', '#5856d6'] });
  }, [selectedFormat, activeTab]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const addComponent = async (type: string) => {
    const designMod = await import('./engine/designEngine');
    const blueprint = designMod.componentBlueprints[type];
    if (blueprint) {
      setCanvasComponents(prev => [...prev, { ...blueprint, id: Math.random().toString(36).substr(2, 9) }]);
    }
  };

  const copyCode = async () => {
    navigator.clipboard.writeText(generatedCode);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const startVoice = () => {
    setIsListening(true);
    voiceEngine.startListening(() => {
      setIsListening(false);
    });
  };

  const handleWebCapture = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const resultUrl = await web.captureWebPage(webUrl);
      const newFile: ProcessedFile = {
        id: Math.random().toString(36).substr(2, 9),
        originalName: `Web Capture: ${webUrl}`,
        originalUrl: resultUrl, // For web, original is same as result
        resultUrl,
        format: 'web-capture',
        mimeType: 'image/png'
      };
      setActiveFile(newFile);
      setProcessedFiles(prev => [newFile, ...prev]);
      confetti({ particleCount: 50, spread: 30, origin: { y: 0.6 } });
    } catch (err: any) {
      setError(err.message || 'Web capture failed');
    }
    setIsProcessing(false);
  };

  return (
    <div className="app-container">
      <aside className="sidebar glass">
        <header>
          <h1>OmniConvert</h1>
          <p className="subtitle">The Ultimate Conversion Hub</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '20px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          {[
            { id: 'media', icon: <ImageIcon size={14} />, label: 'Med' },
            { id: 'video', icon: <Video size={14} />, label: 'Vid' },
            { id: 'viral', icon: <Sparkles size={14} />, label: 'Vir' },
            { id: 'print', icon: <Printer size={14} />, label: 'Prn' },
            { id: 'audio', icon: <Music size={14} />, label: 'Aud' },
            { id: 'security', icon: <ShieldCheck size={14} />, label: 'Sec' },
            { id: 'ai', icon: <Wand2 size={14} />, label: 'AI' },
            { id: 'threeD', icon: <Box size={14} />, label: '3D' },
            { id: 'magic', icon: <WandSparkles size={14} />, label: 'Mag' },
            { id: 'brand', icon: <QrCode size={14} />, label: 'QR' },
            { id: 'document', icon: <Files size={14} />, label: 'Doc' },
            { id: 'web', icon: <Globe size={14} />, label: 'Web' },
            { id: 'mockup', icon: <Layout size={14} />, label: 'Mok' },
            { id: 'social', icon: <Plus size={14} />, label: 'Soc' },
            { id: 'analytics', icon: <Database size={14} />, label: 'Crt' },
            { id: 'cyber', icon: <Code2 size={14} />, label: 'Hkr' },
            { id: 'data', icon: <Database size={14} />, label: 'Dat' },
            { id: 'dev', icon: <Code2 size={14} />, label: 'Dev' },
            { id: 'design', icon: <Layout size={14} />, label: 'Des' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const defaultFormats: Record<string, string> = {
                  media: 'webp', video: 'mp4', viral: '9-16', print: 'card-85-55', audio: 'mp3',
                  security: 'strip', ai: 'bg-remove', threeD: 'stl-gen', magic: 'colorize',
                  brand: 'qr-art', document: 'pdf-merge', web: 'url-shot', mockup: 'iphone', social: 'vintage',
                  analytics: 'bar-chart', cyber: 'ascii', data: 'ocr', dev: 'json-csv'
                };
                setSelectedFormat(defaultFormats[tab.id] || 'webp');
              }}
              style={{
                padding: '10px 2px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                color: '#fff', fontSize: '9px', fontWeight: '800', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{ transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)' }}>{tab.icon}</div>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="voice-section">
          <button onClick={startVoice} style={{ width: '100%', marginBottom: 12, padding: 10, background: isListening ? '#007aff' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Mic size={16} /> {isListening ? 'Listening...' : 'Voice Control'}
          </button>

          <div className="subtitle" style={{ marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {activeTab.toUpperCase()} STUDIO
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {(() => {
              const toolsByTab: Record<string, string[]> = {
                media: ['webp', 'png', 'jpeg', 'bmp', 'pdf', 'svg', 'ico', 'tiff', 'docx', 'md', 'txt'],
                video: ['mp4', 'webm', 'avi', 'mov', 'gif', 'mp3'],
                viral: ['9-16', 'highlights', 'shorts'],
                print: ['card-85-55', 'epub-to-pdf'],
                audio: ['mp3', 'wav', 'flac', 'meta-edit'],
                security: ['strip', 'watermark'],
                ai: ['bg-remove', 'upscale-4x'],
                threeD: ['stl-gen', 'obj-export'],
                magic: ['colorize', 'restore', 'denoise'],
                brand: ['qr-art', 'palette-gen'],
                document: ['pdf-merge', 'pdf-split', 'doc-markdown'],
                web: ['url-shot', 'web-capture'],
                mockup: ['iphone', 'macbook'],
                social: ['vintage', 'cyberpunk', 'cinematic', 'bw', 'warm'],
                analytics: ['bar-chart', 'csv-to-img'],
                cyber: ['ascii', 'hash-gen', 'secure-scan'],
                data: ['ocr', 'excel-export', 'sign-doc'],
                dev: ['json-csv', 'csv-json', 'xml-json', 'base64'],
                design: ['button', 'input', 'card', 'login', 'navbar']
              };

              return (toolsByTab[activeTab] || toolsByTab.media).map(f => (
                <button
                  key={f}
                  onClick={() => { if (activeTab === 'design') addComponent(f); else setSelectedFormat(f as any); }}
                  className={`card ${selectedFormat === f && activeTab !== 'design' ? 'active-tool' : ''}`}
                  style={{
                    justifyContent: 'center', padding: '6px', fontSize: '9px', fontWeight: '800', cursor: 'pointer',
                    background: selectedFormat === f && activeTab !== 'design' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid ' + (selectedFormat === f && activeTab !== 'design' ? 'var(--accent-primary)' : 'var(--glass-border)'),
                    borderRadius: '8px', color: '#fff', height: '32px'
                  }}
                >
                  {activeTab === 'design' ? <Plus size={10} style={{ marginRight: 4 }} /> : null}
                  {f.replace('-', ' ').toUpperCase()}
                </button>
              ));
            })()}
          </div>

          {activeTab === 'threeD' && activeFile && (
            <div className="glass" style={{ marginTop: '20px', padding: '15px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
              <div className="subtitle" style={{ fontSize: '10px', marginBottom: '15px' }}>3D ADJUSTMENTS</div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#a1a1a1', marginBottom: '4px' }}>
                  <span>Extrusion Depth</span>
                  <span>{threeDSettings.zScale}x</span>
                </div>
                <input
                  type="range" min="1" max="15" step="0.5"
                  value={threeDSettings.zScale}
                  onChange={(e) => setThreeDSettings(prev => ({ ...prev, zScale: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#a1a1a1', marginBottom: '4px' }}>
                  <span>Resolution</span>
                  <span>{threeDSettings.res}px</span>
                </div>
                <input
                  type="range" min="20" max="200" step="10"
                  value={threeDSettings.res}
                  onChange={(e) => setThreeDSettings(prev => ({ ...prev, res: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <button
                onClick={() => setThreeDSettings(prev => ({ ...prev, invert: !prev.invert }))}
                style={{
                  width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  background: threeDSettings.invert ? 'var(--accent-primary)' : 'transparent',
                  color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {threeDSettings.invert ? <Check size={12} /> : null} Invert Heightmap
              </button>

              <button
                onClick={async () => {
                  if (activeFile?.originalFile) {
                    setIsProcessing(true);
                    const file = activeFile.originalFile;
                    const resultUrl = selectedFormat === 'stl-gen'
                      ? await threeD.imageTo3D(file, threeDSettings)
                      : await threeD.generateOBJ(file, threeDSettings);

                    setActiveFile(prev => prev ? { ...prev, resultUrl } : null);
                    setProcessedFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, resultUrl } : f));
                    setIsProcessing(false);
                    confetti({ particleCount: 50, spread: 30, origin: { y: 0.6 } });
                  }
                }}
                className="badge badge-purple"
                style={{ width: '100%', marginTop: '12px', border: 'none', cursor: 'pointer', height: '32px' }}
              >
                Apply Changes
              </button>
            </div>
          )}

          {isProcessing && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${conversionProgress}%`, background: 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, marginTop: 20, display: 'flex', flexDirection: 'column' }}>
          <div className="subtitle" style={{ marginBottom: 16 }}>HISTORY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
            {processedFiles.map(file => (
              <div key={file.id} className="card" onClick={() => setActiveFile(file)}>
                <div style={{ flex: 1, overflow: 'hidden', fontSize: '11px' }}>{file.originalName}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={file.resultUrl} download={`omni_${file.id}.${file.format}`} onClick={e => e.stopPropagation()}><Download size={14} color="#a1a1a1" /></a>
                  <button onClick={e => { e.stopPropagation(); setProcessedFiles(prev => prev.filter(f => f.id !== file.id)); if (activeFile?.id === file.id) setActiveFile(null); }} style={{ background: 'transparent', border: 'none' }}><Trash2 size={14} color="#ff453a" /></button>
                </div>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <main className="main-workspace">
        {activeTab === 'design' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Design-to-Code Canvas</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setCanvasComponents([])} className="badge badge-blue" style={{ border: 'none', cursor: 'pointer' }}>Clear</button>
                <button onClick={copyCode} className="badge badge-purple" style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {copying ? <Check size={14} /> : <Copy size={14} />} {copying ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="glass" style={{ borderRadius: '24px', background: 'rgba(0,0,0,0.4)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', overflowY: 'auto' }}>
                {canvasComponents.length === 0 && <span style={{ color: '#555', marginTop: '100px' }}>Select components...</span>}
                {canvasComponents.map(comp => <div key={comp.id} className={comp.styles}>{comp.label}</div>)}
              </div>
              <div className="glass" style={{ borderRadius: '24px', background: '#0a0a0a', padding: '20px', overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '12px', color: '#fff', lineHeight: '1.6' }}>
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
            {!activeFile ? (
              activeTab === 'web' ? (
                <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '20px' }}>
                  <div className="drop-zone-icon"><Globe size={64} style={{ color: 'var(--accent-primary)' }} /></div>
                  <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Web Studio</h2>
                  <p style={{ color: '#a1a1a1', fontSize: '16px', maxWidth: '400px', textAlign: 'center' }}>
                    Enter any URL below to generate a high-resolution screenshot instantly.
                  </p>

                  <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
                    <input
                      type="text"
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      placeholder="https://example.com"
                      style={{
                        width: '100%', padding: '20px 30px', borderRadius: '24px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '18px', outline: 'none'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleWebCapture()}
                    />
                    <button
                      onClick={handleWebCapture}
                      className="badge badge-blue"
                      style={{
                        position: 'absolute', right: '10px', top: '10px', bottom: '10px',
                        height: 'auto', padding: '0 30px', borderRadius: '16px', border: 'none', cursor: 'pointer'
                      }}
                    >
                      {isProcessing ? 'Capturând...' : 'Capture'}
                    </button>
                  </div>
                </div>
              ) : activeTab === 'analytics' ? (
                <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '20px' }}>
                  <div className="drop-zone-icon"><Database size={64} style={{ color: 'var(--accent-primary)' }} /></div>
                  <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Analytics Studio</h2>
                  <p style={{ color: '#a1a1a1', fontSize: '16px', maxWidth: '400px', textAlign: 'center' }}>
                    Enter Label,Value CSV data below to generate an instant chart.
                  </p>
                  <textarea
                    value={analyticsCsv}
                    onChange={(e) => setAnalyticsCsv(e.target.value)}
                    style={{
                      width: '100%', maxWidth: '600px', height: '150px', padding: '20px', borderRadius: '16px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontFamily: 'monospace', outline: 'none'
                    }}
                  />
                  <button onClick={handleWebCapture} className="badge badge-purple" style={{ height: '50px', padding: '0 40px', border: 'none', cursor: 'pointer' }}>Generate Chart</button>
                </div>
              ) : (
                <div className={`drop-zone ${isDragging ? 'active' : ''}`} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} onClick={() => fileInputRef.current?.click()} style={{ flex: 1 }}>
                  <input type="file" multiple hidden ref={fileInputRef} onChange={e => e.target.files && handleFiles(e.target.files)} />
                  <div className="drop-zone-icon"><Upload size={64} /></div>
                  <h2>Drop files here</h2>
                  <p>or click to browse</p>
                </div>
              )
            ) : (
              <div className="preview-container glass" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                  {(() => {
                    if (!activeFile) return null;
                    const mime = activeFile.mimeType || '';
                    if (activeTab === 'threeD' && (mime === 'model/stl' || activeFile.format === 'stl-gen' || mime === 'model/obj' || activeFile.format === 'obj-export')) {
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', height: '100%', minHeight: '500px' }}>
                          {/* Original Image */}
                          <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                            <div className="subtitle" style={{ marginBottom: '10px' }}>ORIGINAL PHOTO</div>
                            <img src={activeFile.originalUrl} alt="Source" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', objectFit: 'contain' }} />
                          </div>

                          {/* 3D Preview or OBJ placeholder */}
                          <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="subtitle" style={{ marginTop: '20px' }}>3D STUDIO RESULT</div>
                            {(mime === 'model/stl' || activeFile.format === 'stl-gen') ? (
                              <ThreeDViewer url={activeFile.resultUrl} />
                            ) : (
                              <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Box size={80} style={{ marginBottom: '24px', color: 'var(--accent-primary)', filter: 'drop-shadow(0 0 20px rgba(0,122,255,0.3))' }} />
                                <h3 style={{ color: '#fff', marginBottom: '8px' }}>OBJ Model Generated</h3>
                                <p style={{ color: '#a1a1a1', fontSize: '14px' }}>Ready for download. Use STL for live 3D preview.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    if (mime === 'text/plain') return <iframe src={activeFile.resultUrl} style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} title="Preview" />;
                    if (mime.startsWith('video/')) return <video src={activeFile.resultUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />;
                    if (mime.startsWith('audio/')) return <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
                      <Music size={64} style={{ marginBottom: '20px', color: 'var(--accent-primary)' }} />
                      <audio src={activeFile.resultUrl} controls autoPlay style={{ width: '300px' }} />
                    </div>;
                    if (mime === 'application/pdf') return <iframe src={activeFile.resultUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />;
                    return <img src={activeFile.resultUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
                  })()}
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => setActiveFile(null)} className="badge badge-purple" style={{ border: 'none', cursor: 'pointer' }}>Close Preview</button>
                  <div style={{ color: '#ff453a', fontSize: '12px', marginTop: '10px' }}>{error}</div>
                </div>
              </div>
            )}
          </div>
        )}
        <footer className="glass" style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Settings size={20} color="#a1a1a1" />
            <span>Settings</span>
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>Privacy Mode: Local Processing ONLY</div>
        </footer>
      </main>
    </div>
  );
}
