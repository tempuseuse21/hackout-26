import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Building2, 
  Calendar, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import { EnergySource, RECStatus } from '../types';

export const AddRecModal: React.FC = () => {
  const { isAddRecOpen, setIsAddRecOpen, addNewRec, currentUser } = useApp();

  // Form states
  const [recId, setRecId] = useState(`REC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [plantId, setPlantId] = useState('SOLAR-017');
  const [plantName, setPlantName] = useState('Mojave Helios Array IV');
  const [plantCapacityMW, setPlantCapacityMW] = useState(120);
  const [energySource, setEnergySource] = useState<EnergySource>('SOLAR');
  const [location, setLocation] = useState('California, US');
  const [generationId, setGenerationId] = useState(`GEN-${Math.floor(10000 + Math.random() * 90000)}`);
  const [issuerId, setIssuerId] = useState('ISS-WEST-01');
  const [issuerName, setIssuerName] = useState('WestGrid Registries');
  const [currentOwnerName, setCurrentOwnerName] = useState('AeroTech Global Technologies');
  const [generationDate, setGenerationDate] = useState('2026-08-15');
  const [verifiedGenerationMWh, setVerifiedGenerationMWh] = useState(11400);
  const [claimedGenerationMWh, setClaimedGenerationMWh] = useState(18500);
  const [recQuantityMWh, setRecQuantityMWh] = useState(18500);
  const [issuanceFrequencyDays, setIssuanceFrequencyDays] = useState(30);
  const [transferFrequencyDays, setTransferFrequencyDays] = useState(14);
  const [transferCount, setTransferCount] = useState(1);
  const [status, setStatus] = useState<RECStatus>('ACTIVE');
  
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAddRecOpen) return null;

  // Preset loaders for instant judge demo
  const loadSuspiciousScenario = () => {
    setRecId(`REC-SUSP-${Math.floor(1000 + Math.random() * 9000)}`);
    setPlantId('SOLAR-017');
    setPlantName('Mojave Helios Array IV');
    setPlantCapacityMW(120);
    setEnergySource('SOLAR');
    setLocation('California, US');
    setGenerationId('GEN-DUAL-88421');
    setIssuerId('ISS-WEST-01');
    setIssuerName('WestGrid Registries');
    setCurrentOwnerName('AeroTech Global Technologies');
    setGenerationDate('2026-08-15');
    setVerifiedGenerationMWh(11400);
    setClaimedGenerationMWh(18500); // 62.3% mismatch!
    setRecQuantityMWh(18500);
    setIssuanceFrequencyDays(7);
    setTransferFrequencyDays(2);
    setTransferCount(4);
    setStatus('ACTIVE');
    setFormErrors([]);
  };

  const loadCleanScenario = () => {
    setRecId(`REC-CLEAN-${Math.floor(1000 + Math.random() * 9000)}`);
    setPlantId('WIND-004');
    setPlantName('Columbia Gorge Wind Farm');
    setPlantCapacityMW(85);
    setEnergySource('WIND');
    setLocation('Oregon, US');
    setGenerationId(`GEN-VERIF-${Math.floor(10000 + Math.random() * 90000)}`);
    setIssuerId('ISS-PAC-02');
    setIssuerName('Pacific Clean Issuers');
    setCurrentOwnerName('TerraVerde Sustainable Funds');
    setGenerationDate('2026-08-20');
    setVerifiedGenerationMWh(14200);
    setClaimedGenerationMWh(14200); // 0% mismatch
    setRecQuantityMWh(14200);
    setIssuanceFrequencyDays(30);
    setTransferFrequencyDays(30);
    setTransferCount(1);
    setStatus('ACTIVE');
    setFormErrors([]);
  };

  const loadDuplicateGenScenario = () => {
    setRecId(`REC-TWIN-${Math.floor(1000 + Math.random() * 9000)}`);
    setPlantId('SOLAR-031');
    setPlantName('Desert Sun PV Station Alpha');
    setPlantCapacityMW(95);
    setEnergySource('SOLAR');
    setLocation('Nevada, US');
    setGenerationId('GEN-88421'); // Shared generation ID!
    setIssuerId('ISS-SW-04');
    setIssuerName('Southwest REC Clearing');
    setCurrentOwnerName('EcoClear Brokerage');
    setGenerationDate('2026-08-12');
    setVerifiedGenerationMWh(9200);
    setClaimedGenerationMWh(9200);
    setRecQuantityMWh(9200);
    setIssuanceFrequencyDays(14);
    setTransferFrequencyDays(5);
    setTransferCount(2);
    setStatus('ACTIVE');
    setFormErrors([]);
  };

  const handleSave = (analyzeImmediately: boolean) => {
    setFormErrors([]);
    const errors: string[] = [];

    if (!recId.trim()) errors.push('REC ID is required');
    if (!plantId.trim()) errors.push('Plant ID is required');
    if (!generationId.trim()) errors.push('Generation ID is required');
    if (claimedGenerationMWh <= 0) errors.push('Claimed generation must be greater than 0');
    if (verifiedGenerationMWh < 0) errors.push('Verified generation cannot be negative');
    if (plantCapacityMW <= 0) errors.push('Plant capacity must be greater than 0');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsProcessing(true);

    const payload = {
      id: recId.trim(),
      plantId: plantId.trim(),
      plantName: plantName.trim(),
      plantCapacityMW: Number(plantCapacityMW),
      energySource,
      location,
      generationId: generationId.trim(),
      issuerId,
      issuerName,
      currentOwnerId: 'BUY-NEW-01',
      currentOwnerName,
      generationDate,
      issuanceDate: new Date().toISOString().slice(0, 10),
      claimedGenerationMWh: Number(claimedGenerationMWh),
      verifiedGenerationMWh: Number(verifiedGenerationMWh),
      eligibleRenewableMWh: Number(verifiedGenerationMWh),
      energyQuantityMWh: Number(recQuantityMWh),
      issuanceFrequencyDays: Number(issuanceFrequencyDays),
      transferFrequencyDays: Number(transferFrequencyDays),
      transferCount: Number(transferCount),
      status
    };

    setTimeout(() => {
      addNewRec(payload, analyzeImmediately);
      setIsProcessing(false);
      setIsAddRecOpen(false);
    }, analyzeImmediately ? 500 : 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
                <span>Add New Renewable Energy Certificate</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Statutory Intake
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Authorized Intake & Automated Risk Pipeline • Role: <strong className="text-emerald-400">{currentUser.role}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddRecOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick-Fill Scenarios */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Judge Demo Scenarios:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadSuspiciousScenario}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Load Suspicious Demo (11,400 vs 18,500 MWh)
            </button>
            <button
              type="button"
              onClick={loadCleanScenario}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Load Clean Normal
            </button>
            <button
              type="button"
              onClick={loadDuplicateGenScenario}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
            >
              Duplicate Gen ID
            </button>
          </div>
        </div>

        {/* Error Banners */}
        {formErrors.length > 0 && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-400">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Please correct the following:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {formErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Section 1: Identification */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-emerald-400" />
              Certificate Identifiers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  REC ID <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={recId}
                  onChange={(e) => setRecId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="REC-10492"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Generation Meter ID <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={generationId}
                  onChange={(e) => setGenerationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="GEN-88421"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Energy Source
                </label>
                <select
                  value={energySource}
                  onChange={(e) => setEnergySource(e.target.value as EnergySource)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="SOLAR">Solar PV</option>
                  <option value="WIND">Wind Turbine</option>
                  <option value="HYDRO">Hydroelectric</option>
                  <option value="GEOTHERMAL">Geothermal</option>
                  <option value="BIOMASS">Biomass Co-Gen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Generation Facility & Capacity */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Generation Facility & Grid Location
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Plant ID & Name <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Mojave Helios Array IV"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Plant Capacity (MW) <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="number" 
                  value={plantCapacityMW}
                  onChange={(e) => setPlantCapacityMW(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Grid Region / Location
                </label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Generation Telemetry & Quantities */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Generation Verification Telemetry (MWh)
              </span>
              {claimedGenerationMWh > verifiedGenerationMWh && (
                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  Mismatch: +{((claimedGenerationMWh - verifiedGenerationMWh) / (verifiedGenerationMWh || 1) * 100).toFixed(1)}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Verified Grid Output (MWh)
                </label>
                <input 
                  type="number" 
                  value={verifiedGenerationMWh}
                  onChange={(e) => setVerifiedGenerationMWh(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Metered SCADA telemetry</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Claimed Generation (MWh) <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="number" 
                  value={claimedGenerationMWh}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setClaimedGenerationMWh(val);
                    setRecQuantityMWh(val);
                  }}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none ${
                    claimedGenerationMWh > verifiedGenerationMWh * 1.15
                      ? 'border-rose-500/50 bg-rose-950/20'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Issuer self-reported</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  REC Quantity (1 REC = 1 MWh)
                </label>
                <input 
                  type="number" 
                  value={recQuantityMWh}
                  onChange={(e) => setRecQuantityMWh(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Certificates issued</span>
              </div>
            </div>
          </div>

          {/* Section 4: Lifecycle & Ownership */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Ownership & Transfer Behavior
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Accredited Issuer
                </label>
                <input 
                  type="text" 
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Current Owner / Buyer
                </label>
                <input 
                  type="text" 
                  value={currentOwnerName}
                  onChange={(e) => setCurrentOwnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Generation Date
                </label>
                <input 
                  type="date" 
                  value={generationDate}
                  onChange={(e) => setGenerationDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RECStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="FLAGGED">FLAGGED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="RETIRED">RETIRED</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SHA-256 fingerprint & ledger block auto-generated on intake.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAddRecOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors w-1/3 sm:w-auto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white shadow-xs transition-colors w-1/3 sm:w-auto cursor-pointer"
            >
              Save REC
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isProcessing}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5 w-1/3 sm:w-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isProcessing ? 'Analyzing...' : 'Save & Analyze'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
