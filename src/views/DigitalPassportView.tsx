import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { 
  FileText, 
  Printer, 
  Download, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Sun, 
  Wind, 
  Droplets, 
  Copy, 
  Check, 
  ShieldCheck,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

export const DigitalPassportView: React.FC = () => {
  const { selectedRec, recs, setSelectedRecId, addToast } = useApp();
  const [copiedHash, setCopiedHash] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(selectedRec.fingerprintSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const passportData = {
      standard: 'REC-GUARD-DIGITAL-PASSPORT-v1',
      certificateId: selectedRec.id,
      fingerprintSha256: selectedRec.fingerprintSha256,
      lifecycle: {
        stage1_generation: {
          timestamp: `${selectedRec.generationDate} 08:30:00 UTC`,
          actor: `${selectedRec.plantName} SCADA Telemetry Unit`,
          location: selectedRec.location,
          claimedMWh: selectedRec.claimedGenerationMWh
        },
        stage2_verification: {
          timestamp: `${selectedRec.generationDate} 14:15:00 UTC`,
          actor: 'National Grid Revenue Meter Verification Station',
          location: selectedRec.location,
          verifiedMWh: selectedRec.verifiedGenerationMWh
        },
        stage3_issuance: {
          timestamp: `${selectedRec.issuanceDate} 10:00:00 UTC`,
          actor: selectedRec.issuerName,
          location: 'Central REC Registry',
          issuedQuantityMWh: selectedRec.energyQuantityMWh || selectedRec.claimedGenerationMWh
        },
        stage4_transfer: {
          timestamp: `${selectedRec.issuanceDate} 16:45:00 UTC`,
          actor: `${selectedRec.issuerName} -> ${selectedRec.currentOwnerName}`,
          location: 'Bilateral Spot Transfer Stream',
          transferCount: selectedRec.transferCount
        },
        stage5_retirement: {
          timestamp: selectedRec.retirementDate ? `${selectedRec.retirementDate} 17:00:00 UTC` : 'PENDING',
          actor: selectedRec.currentOwnerName,
          location: 'Corporate ESG Scope 2 Ledger',
          status: selectedRec.status === 'RETIRED' ? 'RETIRED' : 'ACTIVE_IN_CIRCULATION'
        }
      },
      auditTrust: {
        riskScore: selectedRec.riskScore,
        riskBand: selectedRec.riskBand,
        flagReasons: selectedRec.flagReasons
      }
    };

    const blob = new Blob([JSON.stringify(passportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `REC_Passport_${selectedRec.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Passport Exported',
      message: `Signed JSON verifiable digital passport generated for ${selectedRec.id}.`
    });
  };

  const isSolar = String(selectedRec.energySource).toUpperCase() === 'SOLAR';
  const isWind = String(selectedRec.energySource).toUpperCase() === 'WIND';
  const SourceIcon = isSolar ? Sun : isWind ? Wind : Droplets;

  // 5 Statutory Lifecycle Stages
  const lifecycleStages = [
    {
      num: 1,
      title: 'Generation',
      date: `${selectedRec.generationDate} 08:30:00 UTC`,
      actor: `${selectedRec.plantName} SCADA Unit`,
      location: selectedRec.location,
      details: `${selectedRec.claimedGenerationMWh.toLocaleString()} MWh generated (${selectedRec.energySource})`,
      status: 'COMPLETE',
      isWarning: false
    },
    {
      num: 2,
      title: 'Verification',
      date: `${selectedRec.generationDate} 14:15:00 UTC`,
      actor: 'National Grid Revenue Meter Station',
      location: selectedRec.location,
      details: `${selectedRec.verifiedGenerationMWh.toLocaleString()} MWh verified by revenue meter`,
      status: selectedRec.claimedGenerationMWh > selectedRec.verifiedGenerationMWh * 1.1 ? 'DISCREPANCY' : 'VERIFIED',
      isWarning: selectedRec.claimedGenerationMWh > selectedRec.verifiedGenerationMWh * 1.1
    },
    {
      num: 3,
      title: 'Issuance',
      date: `${selectedRec.issuanceDate} 10:00:00 UTC`,
      actor: selectedRec.issuerName,
      location: 'Central REC Registry',
      details: `Minted ${selectedRec.energyQuantityMWh || selectedRec.claimedGenerationMWh} RECs with SHA-256 seal`,
      status: 'ISSUED',
      isWarning: false
    },
    {
      num: 4,
      title: 'Transfer',
      date: `${selectedRec.issuanceDate} 16:45:00 UTC`,
      actor: `${selectedRec.issuerName} → ${selectedRec.currentOwnerName}`,
      location: 'Spot Market Transfer',
      details: `${selectedRec.transferCount || 1} custody transfer(s) recorded`,
      status: selectedRec.isRetiredReused ? 'INVALID_TRANSFER' : 'TRANSFERRED',
      isWarning: selectedRec.isRetiredReused
    },
    {
      num: 5,
      title: 'Retirement',
      date: selectedRec.retirementDate ? `${selectedRec.retirementDate} 17:00:00 UTC` : 'Pending Beneficiary Action',
      actor: selectedRec.currentOwnerName,
      location: 'Scope 2 Compliance Registry',
      details: selectedRec.status === 'RETIRED' ? 'Certificate permanently retired and consumed' : 'Certificate remains active in secondary circulation',
      status: selectedRec.status === 'RETIRED' ? 'RETIRED' : 'ACTIVE',
      isWarning: selectedRec.isRetiredReused
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Digital Certificate Passport</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete 5-stage chronological lifecycle, custody actors, locations, and cryptographic integrity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Certificate selector */}
          <select
            value={selectedRec.id}
            onChange={(e) => setSelectedRecId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 shadow-xs focus:outline-none"
          >
            {recs.slice(0, 20).map((r, idx) => (
              <option key={`passport-rec-${r.id}-${idx}`} value={r.id}>{r.id} - {r.plantName.slice(0, 18)}</option>
            ))}
          </select>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* Printable Digital Passport Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-8">
        {/* Passport Header: Seal & Authority */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-widest">
                VERIFIABLE CLEAN ENERGY PASSPORT
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                CERTIFICATE #{selectedRec.id}
              </h2>
              <div className="text-xs text-slate-500">
                Registered Authority: <span className="text-slate-900 font-semibold">{selectedRec.issuerName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end items-center gap-1.5">
            <RiskBadge score={selectedRec.riskScore} band={selectedRec.riskBand} size="md" />
            <div className="text-[11px] font-mono text-slate-500">
              STATUS: <span className="text-slate-900 font-bold">{selectedRec.status}</span>
            </div>
          </div>
        </div>

        {/* Certificate Core Visual Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">ENERGY SOURCE</div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <SourceIcon className="w-4 h-4 text-amber-500" />
              <span>{selectedRec.energySource}</span>
            </div>
            <div className="text-[11px] text-slate-500">{selectedRec.location}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">CERTIFIED QUANTITY</div>
            <div className="text-blue-700 font-mono font-bold text-lg">
              {selectedRec.energyQuantityMWh?.toLocaleString() || selectedRec.claimedGenerationMWh.toLocaleString()} MWh
            </div>
            <div className="text-[11px] text-slate-500">1,000 kWh per REC unit</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">GENERATION FACILITY</div>
            <div className="text-slate-900 font-semibold text-xs truncate">{selectedRec.plantName}</div>
            <div className="text-[11px] font-mono text-slate-500">{selectedRec.plantId} ({selectedRec.plantCapacityMW} MW)</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">TELEMETRY RUN ID</div>
            <div className="text-slate-900 font-mono font-bold text-xs">{selectedRec.generationId}</div>
            <div className="text-[11px] text-slate-500">Date: {selectedRec.generationDate}</div>
          </div>
        </div>

        {/* 5-STAGE LIFECYCLE (CRITICAL REQUIREMENT) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base font-bold text-slate-900">5-Stage Chronological Lifecycle</h3>
            <span className="text-xs font-mono text-slate-500">Generation → Verification → Issuance → Transfer → Retirement</span>
          </div>

          <div className="space-y-3">
            {lifecycleStages.map((stage) => (
              <div 
                key={`passport-stage-${stage.num}-${stage.title}`}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  stage.isWarning 
                    ? 'bg-rose-50/50 border-rose-200' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    stage.isWarning 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {stage.num}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{stage.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stage.isWarning ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{stage.details}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Timestamp</span>
                    <span className="font-mono text-slate-700">{stage.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Actor</span>
                    <span className="font-medium text-slate-900 truncate block max-w-[140px]">{stage.actor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                    <span className="text-slate-600">{stage.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic SHA-256 Fingerprint Block */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>CRYPTOGRAPHIC SHA-256 DIGITAL FINGERPRINT:</span>
            </span>
            <button
              onClick={copyHash}
              className="hover:text-slate-900 flex items-center gap-1 text-slate-500 text-[11px]"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
            </button>
          </div>
          <div className="text-blue-900 font-bold break-all bg-white p-3 rounded-lg border border-slate-200 text-xs tracking-wider">
            {selectedRec.fingerprintSha256}
          </div>
        </div>

        {/* Footer Seal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <div className="font-mono text-[11px]">
            LEDGER ANCHOR: <span className="text-slate-900 font-bold">BLOCK #{1000 + (parseInt(selectedRec.id.split('-')[1]) || 100)}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Certified under REC-GUARD Automated Trust Protocol • Scope 2 Auditable
          </div>
        </div>
      </div>
    </div>
  );
};
