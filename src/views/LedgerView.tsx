import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatHash } from '../services/cryptoService';
import { 
  Layers, 
  RefreshCw, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink,
  Info
} from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { 
    ledgerBlocks, 
    verifyLedgerIntegrity, 
    tamperBlock, 
    restoreLedger, 
    inspectRec,
    addToast,
    setActiveTab
  } = useApp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    performed: boolean;
    valid: boolean;
    corruptedIndex?: number;
  } | null>(null);

  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      const result = await verifyLedgerIntegrity();
      setIsVerifying(false);
      setVerificationResult({
        performed: true,
        valid: result.valid,
        corruptedIndex: result.corruptedIndex
      });

      if (result.valid) {
        addToast({
          type: 'success',
          title: 'DLT Integrity Confirmed',
          message: 'All blocks successfully verified with unbroken cryptographic hash linkage.'
        });
      } else {
        addToast({
          type: 'error',
          title: 'TAMPER DETECTED ON LEDGER',
          message: `Block #${result.corruptedIndex} cryptographic integrity violated! Chain linkage broken.`
        });
      }
    }, 400);
  };

  const handleTamper = (index: number) => {
    tamperBlock(index, 'energyQuantityMWh', 99999);
    setVerificationResult(null);
    addToast({
      type: 'warning',
      title: 'Tamper Simulation Injected',
      message: `Modified payload in Block #${index}. Click "Verify Ledger Integrity" to test detection.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Tamper-Evident REC Ledger</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable SHA-256 hash-chained Merkle ledger recording every generation, verification, transfer, and retirement event.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 font-mono">
          <button
            onClick={restoreLedger}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restore Ledger</span>
          </button>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Checking Cryptographic Chain...' : 'Verify Ledger Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult?.performed && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
          verificationResult.valid
            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
        }`}>
          {verificationResult.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm font-mono">
              {verificationResult.valid ? 'Ledger Audit Passed: Cryptographic Integrity Intact' : 'Tamper Detected: Hash Chain Link Broken!'}
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              {verificationResult.valid
                ? 'All block hashes strictly resolve their state payloads and correspond to the recorded previous block hash. Zero ledger manipulation detected.'
                : `Block #${verificationResult.corruptedIndex} payload was modified without consensus authorization. Previous hash linkage has been invalidated.`}
            </p>
          </div>
        </div>
      )}

      {/* Audit Guide Callout */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-2.5 font-mono">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">How the Ledger Detects Tampering: </span>
          Each block contains a cryptographic SHA-256 digest of its state payload (REC ID, Actor, Event, Timestamp) combined with the hash of the preceding block. If any actor alters past generation data or retired certificates, subsequent block hashes break immediately.
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Event ID</th>
                <th className="py-3.5 px-4">REC ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Previous Hash</th>
                <th className="py-3.5 px-4">Current Hash</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {ledgerBlocks.map((block, idx) => {
                const blockNum = block.blockNumber ?? block.index ?? 0;
                const isCorrupted = block.status === 'TAMPERED' || Boolean(block.isTampered);
                const eventType = block.eventType || block.event || 'EVENT';
                const currentHash = block.currentHash || block.hash || '';

                return (
                  <tr key={`ledger-block-${block.transactionId || blockNum}-${idx}`} className={`hover:bg-slate-800/50 transition-colors ${
                    isCorrupted ? 'bg-rose-950/30' : ''
                  }`}>
                    {/* Event ID / Block # */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{blockNum}
                    </td>

                    {/* REC ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      <button 
                        onClick={() => {
                          inspectRec(block.recId);
                          setActiveTab('risk-intelligence');
                        }}
                        className="hover:underline cursor-pointer"
                        title="Inspect in Risk Intelligence"
                      >
                        {block.recId}
                      </button>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {block.timestamp}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {block.actor}
                    </td>

                    {/* Event */}
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        eventType === 'RETIRED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                        eventType === 'TRANSFERRED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                        eventType === 'FLAGGED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        eventType === 'ISSUED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {eventType}
                      </span>
                    </td>

                    {/* Previous Hash */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <span title={block.previousHash}>{formatHash(block.previousHash, 6)}</span>
                        <button 
                          onClick={() => copyHash(block.previousHash)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                          title="Copy Full Hash"
                        >
                          {copiedHash === block.previousHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Current Hash */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className={`font-semibold ${isCorrupted ? 'text-rose-400 font-bold' : 'text-slate-300'}`} title={currentHash}>
                          {formatHash(currentHash, 6)}
                        </span>
                        <button 
                          onClick={() => copyHash(currentHash)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                          title="Copy Full Hash"
                        >
                          {copiedHash === currentHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCorrupted 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isCorrupted ? 'TAMPERED' : 'VALID'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {!isCorrupted ? (
                        <button
                          onClick={() => handleTamper(blockNum)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                          title="Simulate unauthorized payload edit on this block"
                        >
                          Simulate Tamper
                        </button>
                      ) : (
                        <button
                          onClick={restoreLedger}
                          className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                          title="Revert to verified canonical state"
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
