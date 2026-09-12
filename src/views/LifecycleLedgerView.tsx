import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatHash } from '../services/cryptoService';
import { 
  GitCommit, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  RotateCcw, 
  RefreshCw, 
  Layers, 
  Clock, 
  ArrowRight,
  Eye
} from 'lucide-react';

export const LifecycleLedgerView: React.FC = () => {
  const { 
    ledgerBlocks, 
    verifyLedgerIntegrity, 
    tamperBlock, 
    restoreLedger, 
    isLedgerValid, 
    inspectRec,
    addToast
  } = useApp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    performed: boolean;
    valid: boolean;
    corruptedIndex?: number;
  } | null>(null);

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
          title: 'TAMPER DETECTED ON DLT',
          message: `Block #${result.corruptedIndex} cryptographic integrity violated! Previous hash chain broken.`
        });
      }
    }, 450);
  };

  const handleTamper = (index: number) => {
    tamperBlock(index, 'energyQuantityMWh', 99999);
    setVerificationResult(null);
  };

  const lifecycleStages = [
    { name: '1. Generation', desc: 'Plant SCADA meters record net electricity export to grid.' },
    { name: '2. Issuance', desc: 'Accredited registry issues certified REC batch with SHA-256 seal.' },
    { name: '3. Verification', desc: 'REC-GUARD runs 10D Isolation Forest and 5 fraud rules.' },
    { name: '4. Transfer', desc: 'Brokers, utilities and corporate buyers exchange title.' },
    { name: '5. Retirement', desc: 'Claim permanently retired for corporate Scope 2 reporting.' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Cryptographic DLT Lifecycle & Audit Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">
            Permissioned tamper-evident hash-linked journal anchoring every generation event, trade transfer, and retirement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={restoreLedger}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Ledger</span>
          </button>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-transform active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Entire Ledger Chain'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult?.performed && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
          verificationResult.valid
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
        }`}>
          {verificationResult.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">
              {verificationResult.valid ? 'DLT Audit Passed: Perfect Cryptographic Integrity' : 'Integrity Failure: Blockchain Chain Hash Mismatch'}
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              {verificationResult.valid
                ? 'Every block hash accurately resolves its cryptographic state payload and points unbroken to its parent block.'
                : `Block #${verificationResult.corruptedIndex} payload was modified without valid consensus authorization. Chain verification rejected.`}
            </p>
          </div>
        </div>
      )}

      {/* Lifecycle Stage Map */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
          IMMUTABLE REC LIFECYCLE TOPOLOGY
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {lifecycleStages.map((st, i) => (
            <div key={`lifecycle-st-${st.name}-${i}`} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="font-bold text-xs text-emerald-400 font-mono">{st.name}</div>
              <div className="text-[11px] text-slate-400 leading-snug">{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger Block Explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-emerald-400" />
            <span>Chained Block Explorer ({ledgerBlocks.length} Blocks)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">SHA-256 Merkle Chain</span>
        </div>

        <div className="space-y-3">
          {ledgerBlocks.map((block, idx) => {
            const blockNum = block.blockNumber ?? block.index ?? 0;
            const isCorrupted = block.status === 'TAMPERED' || Boolean(block.isTampered);
            const eventType = block.eventType || block.event || 'EVENT';
            const blockHash = block.currentHash || block.hash || '';
            const detailsText = block.details || (block.dataPayload ? `Payload: ${block.actor}` : '');

            return (
              <div
                key={`block-${block.transactionId || blockNum}-${idx}`}
                className={`p-4 rounded-xl border bg-slate-900/70 transition-all ${
                  isCorrupted
                    ? 'border-rose-500/80 bg-rose-950/20 shadow-lg shadow-rose-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  
                  {/* Block Index and Event */}
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isCorrupted ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{blockNum}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold ${
                          eventType === 'RETIRED' ? 'bg-purple-500/20 text-purple-300' :
                          eventType === 'TRANSFERRED' ? 'bg-indigo-500/20 text-indigo-300' :
                          eventType === 'FLAGGED' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {eventType}
                        </span>
                        <span className="font-mono font-bold text-slate-200">{block.recId}</span>
                        {isCorrupted && (
                          <span className="text-[9px] font-mono bg-rose-600 text-white px-1.5 py-0.2 rounded font-black">
                            CORRUPTED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {detailsText} • <span className="font-mono text-[10px] text-slate-500">{block.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hashes and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 font-mono text-[11px]">
                    <div className="space-y-0.5">
                      <div className="text-slate-500 text-[10px]">PREV HASH:</div>
                      <div className="text-slate-400">{formatHash(block.previousHash, 8)}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-slate-500 text-[10px]">BLOCK HASH:</div>
                      <div className={`font-semibold ${isCorrupted ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                        {formatHash(blockHash, 8)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                      <button
                        onClick={() => inspectRec(block.recId)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                      >
                        Dossier
                      </button>
                      {!isCorrupted ? (
                        <button
                          onClick={() => handleTamper(blockNum)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-semibold"
                        >
                          Tamper
                        </button>
                      ) : (
                        <button
                          onClick={restoreLedger}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
