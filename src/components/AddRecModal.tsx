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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>Add New Renewable Energy Certificate</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  Statutory Intake
                </span>
              </h2>
              <p className="text-xs text-slate-500 truncate">
                Authorized Intake & Automated Risk Pipeline • Role: <strong className="text-slate-800">{currentUser.role}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddRecOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick-Fill Scenarios */}
        <div className="px-4 sm:px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Judge Demo Scenarios:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadSuspiciousScenario}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Load Suspicious Demo (11,400 vs 18,500 MWh)
            </button>
            <button
              type="button"
              onClick={loadCleanScenario}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Load Clean Normal
            </button>
            <button
              type="button"
              onClick={loadDuplicateGenScenario}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 transition-colors"
            >
              Duplicate Gen ID
            </button>
          </div>
        </div>

        {/* Error Banners */}
        {formErrors.length > 0 && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
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
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Certificate Identifiers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  REC ID <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={recId}
                  onChange={(e) => setRecId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="REC-10492"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Generation Meter ID <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={generationId}
                  onChange={(e) => setGenerationId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="GEN-88421"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Energy Source
                </label>
                <select
                  value={energySource}
                  onChange={(e) => setEnergySource(e.target.value as EnergySource)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
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
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Generation Facility & Grid Location
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant ID & Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="Mojave Helios Array IV"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant Capacity (MW) <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={plantCapacityMW}
                  onChange={(e) => setPlantCapacityMW(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grid Region / Location
                </label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Generation Telemetry & Quantities */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Generation Verification Telemetry (MWh)
              </span>
              {claimedGenerationMWh > verifiedGenerationMWh && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Mismatch: +{((claimedGenerationMWh - verifiedGenerationMWh) / (verifiedGenerationMWh || 1) * 100).toFixed(1)}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verified Grid Output (MWh)
                </label>
                <input 
                  type="number" 
                  value={verifiedGenerationMWh}
                  onChange={(e) => setVerifiedGenerationMWh(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Metered SCADA telemetry</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Claimed Generation (MWh) <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={claimedGenerationMWh}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setClaimedGenerationMWh(val);
                    setRecQuantityMWh(val);
                  }}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none ${
                    claimedGenerationMWh > verifiedGenerationMWh * 1.15
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Issuer self-reported</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  REC Quantity (1 REC = 1 MWh)
                </label>
                <input 
                  type="number" 
                  value={recQuantityMWh}
                  onChange={(e) => setRecQuantityMWh(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Certificates issued</span>
              </div>
            </div>
          </div>

          {/* Section 4: Lifecycle & Ownership */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Ownership & Transfer Behavior
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accredited Issuer
                </label>
                <input 
                  type="text" 
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Owner / Buyer
                </label>
                <input 
                  type="text" 
                  value={currentOwnerName}
                  onChange={(e) => setCurrentOwnerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Generation Date
                </label>
                <input 
                  type="date" 
                  value={generationDate}
                  onChange={(e) => setGenerationDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RECStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SHA-256 fingerprint & ledger block auto-generated on intake.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAddRecOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-1/3 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 shadow-xs transition-colors w-1/3 sm:w-auto"
            >
              Save REC
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isProcessing}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 w-1/3 sm:w-auto"
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
