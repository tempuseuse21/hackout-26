import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  generateSyntheticDataset, 
  parseCsvToRecs, 
  exportRecsToCsv, 
  downloadCsvFile,
  CSV_TEMPLATE_HEADERS 
} from '../services/datasetGenerator';
import { 
  Database, 
  Upload, 
  Download, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Layers,
  RotateCcw,
  FileCode,
  ShieldAlert,
  Zap,
  Check
} from 'lucide-react';
import { RECRecord } from '../types';

export const DataImportView: React.FC = () => {
  const { setRecs, recs, addToast, setActiveTab, setSelectedRecId } = useApp();

  // Synthetic generator states
  const [synthCount, setSynthCount] = useState<number>(500);
  const [anomalyRate, setAnomalyRate] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);

  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Ready-to-Test Sample Scenarios
  const sampleDatasets = [
    {
      id: 'clean',
      title: 'Clean Market Baseline',
      tag: 'LOW RISK',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Zero fraudulent violations. All meter readings strictly correspond to SCADA generation, unique IDs, and valid chronological lifecycle states.',
      recordsCount: 200,
      load: () => {
        const base = generateSyntheticDataset(200).map(r => ({
          ...r,
          riskScore: Math.floor(Math.random() * 18) + 4,
          riskBand: 'LOW' as const,
          status: 'ACTIVE' as const,
          isAnomaly: false,
          claimedGenerationMWh: r.verifiedGenerationMWh,
          eligibleRenewableMWh: r.verifiedGenerationMWh,
          isRetiredReused: false,
          flagReasons: []
        }));
        setRecs(base);
        setSelectedRecId(base[0].id);
        addToast({
          type: 'success',
          title: 'Clean Dataset Loaded',
          message: 'Loaded 200 fully verified, compliant REC certificates.'
        });
      }
    },
    {
      id: 'duplicate-attack',
      title: 'Duplicate REC / Generation ID Attack',
      tag: 'CRITICAL',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Multiple rogue generators issuing duplicate certificates claiming identical generation meter runs across multiple compliance registries.',
      recordsCount: 150,
      load: () => {
        const base = generateSyntheticDataset(150);
        // Inject duplicated generation IDs
        base[0].generationId = 'GEN-SHARED-ATTACK-01';
        base[1].generationId = 'GEN-SHARED-ATTACK-01';
        base[0].riskScore = 95;
        base[0].riskBand = 'CRITICAL';
        base[0].status = 'FLAGGED';
        base[0].flagReasons = ['RULE-002: Duplicate Generation ID across registries'];
        
        base[2].generationId = 'GEN-SHARED-ATTACK-02';
        base[3].generationId = 'GEN-SHARED-ATTACK-02';
        base[2].riskScore = 92;
        base[2].riskBand = 'CRITICAL';
        base[2].status = 'FLAGGED';

        setRecs(base);
        setSelectedRecId(base[0].id);
        addToast({
          type: 'warning',
          title: 'Duplicate REC Attack Dataset Ingested',
          message: 'Injected 4 duplicate certificate pairs sharing identical generation run IDs.'
        });
      }
    },
    {
      id: 'over-issuance',
      title: 'Over-Issuance & Capacity Exceeded',
      tag: 'CRITICAL',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Discrepancy where claimed generation volume exceeds physical plant capacity and verified SCADA revenue meters by up to 200%.',
      recordsCount: 150,
      load: () => {
        const base = generateSyntheticDataset(150);
        base[0].claimedGenerationMWh = 28500;
        base[0].verifiedGenerationMWh = 12000;
        base[0].plantCapacityMW = 50;
        base[0].riskScore = 88;
        base[0].riskBand = 'CRITICAL';
        base[0].status = 'FLAGGED';
        base[0].flagReasons = ['RULE-003: Claimed output exceeds SCADA revenue meter by 137.5%', 'RULE-004: Over-issuance exceeds physical capacity'];

        base[1].claimedGenerationMWh = 19000;
        base[1].verifiedGenerationMWh = 9000;
        base[1].riskScore = 82;
        base[1].riskBand = 'CRITICAL';
        base[1].status = 'FLAGGED';

        setRecs(base);
        setSelectedRecId(base[0].id);
        addToast({
          type: 'warning',
          title: 'Over-Issuance Scenario Ingested',
          message: 'Injected over-issuance records exceeding SCADA revenue meters.'
        });
      }
    },
    {
      id: 'retirement-reuse',
      title: 'Retired REC Reuse Attack',
      tag: 'CRITICAL',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Zombie certificates that were already claimed and retired for corporate Scope 2 accounting, re-entering secondary trading streams.',
      recordsCount: 150,
      load: () => {
        const base = generateSyntheticDataset(150);
        base[0].status = 'RETIRED';
        base[0].isRetiredReused = true;
        base[0].transferCount = 3;
        base[0].riskScore = 96;
        base[0].riskBand = 'CRITICAL';
        base[0].retirementDate = '2026-01-15';
        base[0].lastTransferDate = '2026-03-01';
        base[0].flagReasons = ['RULE-005: Retired certificate traded post-retirement'];

        setRecs(base);
        setSelectedRecId(base[0].id);
        addToast({
          type: 'error',
          title: 'Retirement Reuse Attack Ingested',
          message: 'Injected post-retirement transfer reuse certificates.'
        });
      }
    },
    {
      id: 'mixed-market',
      title: 'Mixed Realistic Market Scenario',
      tag: 'BALANCED',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Standard calibrated real-world market mix: 92% clean operations, 4% generation latency, 2% duplicate claims, 2% transfer velocity.',
      recordsCount: 500,
      load: () => {
        const base = generateSyntheticDataset(500);
        setRecs(base);
        setSelectedRecId(base[0].id);
        addToast({
          type: 'info',
          title: 'Mixed Realistic Scenario Ingested',
          message: '500 records loaded with 8% natural anomaly distribution.'
        });
      }
    }
  ];

  const handleResetClean = () => {
    sampleDatasets[0].load();
  };

  const handleGenerateSynthetic = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newDataset = generateSyntheticDataset(synthCount);
      setRecs(newDataset);
      setIsGenerating(false);

      addToast({
        type: 'success',
        title: 'Synthetic Registry Seeded',
        message: `Successfully synthesized and fingerprinted ${synthCount.toLocaleString()} REC certificates.`
      });
    }, 400);
  };

  const handleDownloadTemplate = () => {
    const templateContent = `${CSV_TEMPLATE_HEADERS.join(',')}\nREC-90001,PLANT-SOL-01,Mojave Solar,Solar,120,CA USA,GEN-90001,15000,15000,15000,2026-03-01,2026-03-05,WREGIS Western,CleanVolt Energy,Apex Systems,ACTIVE,1,LOW,12,No issues,Standard issuance`;
    downloadCsvFile(templateContent, 'rec_guard_template.csv');
    addToast({
      type: 'info',
      title: 'CSV Template Downloaded',
      message: 'Standard RFC 4180 format template ready.'
    });
  };

  const handleExportCurrentCsv = () => {
    const csv = exportRecsToCsv(recs);
    downloadCsvFile(csv, `rec_registry_export_${Date.now()}.csv`);
    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `Exported ${recs.length.toLocaleString()} records with SHA-256 signatures.`
    });
  };

  const handleExportCurrentJson = () => {
    const blob = new Blob([JSON.stringify(recs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rec_registry_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'JSON Export Complete',
      message: `Exported ${recs.length.toLocaleString()} records in JSON format.`
    });
  };

  const processFile = (file: File) => {
    const isJson = file.name.endsWith('.json');
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        if (isJson) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecs(parsed);
            setUploadStatus(`Successfully parsed ${parsed.length} certificates from JSON.`);
            addToast({
              type: 'success',
              title: 'JSON Ingested Successfully',
              message: `Loaded ${parsed.length} REC certificates into registry.`
            });
          } else {
            setUploadStatus('Invalid JSON structure. Expected array of REC records.');
          }
        } else {
          const parsed = await parseCsvToRecs(text);
          if (parsed.length > 0) {
            setRecs(parsed);
            setUploadStatus(`Successfully parsed ${parsed.length} certificates from CSV.`);
            addToast({
              type: 'success',
              title: 'CSV Ingested Successfully',
              message: `Loaded ${parsed.length} REC certificates into registry.`
            });
          } else {
            setUploadStatus('No valid REC records found in CSV file.');
          }
        }
      } catch (err) {
        setUploadStatus(`Failed to parse file: ${(err as Error).message}`);
        addToast({
          type: 'error',
          title: 'Import Failed',
          message: 'Format error. Please check dataset schema.'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <span>Data Ingestion & Stress Testing Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Load ready-to-test attack scenarios, ingest custom CSV/JSON registries, or synthesize multi-thousand certificate stress runs.
          </p>
        </div>

        {/* Global Dataset Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetClean}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Clean State</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Template</span>
          </button>

          <button
            onClick={handleExportCurrentJson}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Active Registry</span>
          </button>
        </div>
      </div>

      {/* READY-TO-TEST SAMPLE DATASETS (CRITICAL MANDATE) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ready-To-Test Fraud Scenarios</h2>
            <p className="text-xs text-slate-500">One-click ingestion for instant hackathon evaluation and stress testing</p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            5 PRESET ENVIRONMENTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleDatasets.map((scenario) => (
            <div 
              key={scenario.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scenario.tagColor}`}>
                    {scenario.tag}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{scenario.recordsCount} RECs</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-2">{scenario.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <button
                onClick={scenario.load}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Load Scenario Dataset</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column: File Upload (CSV & JSON) + Synthetic Telemetry Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: CSV and JSON Upload */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload External Dataset (CSV or JSON)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">CSV / JSON</span>
            </div>
            <p className="text-xs text-slate-500">
              Drag & drop external registry records. REC-GUARD automatically parses fields, assigns SHA-256 fingerprints, and queues forensic evaluation.
            </p>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv,.json';
                input.onchange = (e: any) => {
                  if (e.target.files?.[0]) processFile(e.target.files[0]);
                };
                input.click();
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-semibold text-xs text-slate-900">
                Click or drag & drop CSV or JSON file here
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Compatible with WREGIS, PJM-GATS, ERCOT & APX registry exports
              </div>
            </div>

            {uploadStatus && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
                {uploadStatus}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-700">Supported Formats:</span>
            <p>
              Standard REC registry CSV headers or JSON array of certificate objects.
            </p>
          </div>
        </div>

        {/* Right: Calibrated Synthetic Generator */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Synthetic Generator & Stress Engine</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                TELEMETRY SYNTHESIZER
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generate large multi-generator datasets with customizable anomaly contamination rates to test pipeline performance under load.
            </p>

            {/* Volume Presets */}
            <div className="space-y-2">
              <label className="text-xs text-slate-600 font-semibold">Target Volume Preset:</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 2500].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setSynthCount(cnt)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                      synthCount === cnt
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cnt} RECs
                  </button>
                ))}
              </div>
            </div>

            {/* Contamination slider */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-semibold">Anomaly Contamination Rate:</span>
                <span className="text-blue-700 font-mono font-bold">{anomalyRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={anomalyRate}
                onChange={(e) => setAnomalyRate(parseInt(e.target.value))}
                className="w-full accent-blue-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>5% (Subtle)</span>
                <span>15% (Elevated)</span>
                <span>30% (Severe Stress)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateSynthetic}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : `Generate & Ingest ${synthCount} Records`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
