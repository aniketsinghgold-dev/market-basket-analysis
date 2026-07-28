import React, { useState } from 'react';
import { useMarketBasketStore } from '../store/useMarketBasketStore';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Database, 
  Trash2, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const DatasetUpload: React.FC = () => {
  const { 
    uploadCSVFile, 
    loadBenchmarkDataset, 
    diagnostics, 
    previewRows, 
    datasetName, 
    setActiveTab, 
    isMining 
  } = useMarketBasketStore();

  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIsUploading(true);
      await uploadCSVFile(file);
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      await uploadCSVFile(file);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-blue-400" />
            <span>Dataset Ingestion & Auto-Cleaning Suite</span>
          </h1>
          <p className="text-sm text-slate-400 pt-1">
            Upload custom retail CSV or Excel transaction files. Automatic column inference, duplicate removal, and missing value cleaning.
          </p>
        </div>

        {/* Quick Benchmark Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Or Load Benchmark:</span>
          <button
            disabled={isMining}
            onClick={async () => await loadBenchmarkDataset('groceries')}
            className="px-3 py-1.5 rounded-lg bg-surface border border-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Groceries (10k)</span>
          </button>
          <button
            disabled={isMining}
            onClick={async () => await loadBenchmarkDataset('tech')}
            className="px-3 py-1.5 rounded-lg bg-surface border border-slate-800 hover:border-cyan-500 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tech Electronics</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`glass-panel p-10 rounded-3xl border-2 border-dashed transition-all text-center space-y-4 ${
          dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
          {isUploading ? (
            <RefreshCw className="w-7 h-7 animate-spin text-blue-400" />
          ) : (
            <UploadCloud className="w-7 h-7" />
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">
            {isUploading ? 'Ingesting & Auto-Cleaning Dataset...' : 'Drag & drop transaction CSV / Excel file here'}
          </h3>
          <p className="text-xs text-slate-400 pt-1">
            Supports Long Transaction Logs <code className="text-slate-300 font-mono">[TransactionID, ItemDescription]</code>
          </p>
        </div>

        <div className="pt-2">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-blue-500/20 transition-all">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* Dataset Health Diagnostics Cards */}
      {diagnostics && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Data Health & Diagnostics Report</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 bg-surface px-2.5 py-1 rounded-md border border-slate-800">
              Active File: {datasetName}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="glass-panel p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Raw Rows</span>
              <p className="text-xl font-mono font-bold text-white">{diagnostics.total_rows?.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400">Raw log count</span>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Valid Cleaned Rows</span>
              <p className="text-xl font-mono font-bold text-emerald-400">{diagnostics.clean_rows?.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-400/80">100% Prepared</span>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Unique Transactions</span>
              <p className="text-xl font-mono font-bold text-blue-400">{diagnostics.unique_transactions?.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400">Unique order IDs</span>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Unique Product SKUs</span>
              <p className="text-xl font-mono font-bold text-cyan-400">{diagnostics.unique_items?.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400">Item descriptions</span>
            </div>

          </div>

          {/* Diagnostics Column Auto-Detection Notification */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Auto-Detected Mapping: Transaction Column = <b>{diagnostics.transaction_col}</b> | Item Column = <b>{diagnostics.item_col}</b>.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('mining')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shrink-0 transition-all"
            >
              <span>Proceed to Algorithm Mining</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dataset Preview Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
            <div className="px-5 py-3 border-b border-slate-800 bg-surface/50 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Cleaned Dataset Sample Preview</h4>
              <span className="text-[11px] text-slate-400">Showing first 20 records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/80 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Transaction ID</th>
                    <th className="px-4 py-2.5 font-semibold">Product Description</th>
                    <th className="px-4 py-2.5 font-semibold">Category</th>
                    <th className="px-4 py-2.5 font-semibold">Quantity</th>
                    <th className="px-4 py-2.5 font-semibold">Price ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2 text-blue-400">{row[diagnostics.transaction_col] || row.TransactionID || idx + 1001}</td>
                      <td className="px-4 py-2 text-slate-100 font-sans font-medium">{row[diagnostics.item_col] || row.ItemDescription || row.item}</td>
                      <td className="px-4 py-2 text-slate-400 font-sans">{row.Category || 'Retail SKU'}</td>
                      <td className="px-4 py-2 text-slate-300">{row.Quantity || 1}</td>
                      <td className="px-4 py-2 text-emerald-400">${row.Price ? Number(row.Price).toFixed(2) : '3.99'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
