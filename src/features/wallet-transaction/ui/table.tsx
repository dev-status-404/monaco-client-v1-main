"use client";

import React, { useState } from "react";
import { useWalletTransactions } from "../../../hooks/wallet-transaction";

const WalletTransactionTable = () => {
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any>(null); // Modal ke liye state
  const limit = 10;

  const { data: apiResponse, isLoading, isError } = useWalletTransactions({ page, limit });

  const transactions = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
  const pagination = apiResponse?.pagination;

  return (
    <div className="w-full bg-[#1a1a1a]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-zinc-900 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Direction</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.map((tx: any) => (
              <tr 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)} // Click par modal khulega
                className="hover:bg-zinc-800 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-200 capitalize">{tx.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase ${
                    tx.direction === 'in' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {tx.direction}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-mono font-bold text-right ${
                  tx.direction === 'in' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.direction === 'in' ? '+' : '-'}{Number(tx.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase border ${
                    tx.status === 'success' || tx.status === 'completed' 
                      ? 'border-green-900 bg-green-900/20 text-green-400' 
                      : 'border-yellow-900 bg-yellow-900/20 text-yellow-400'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-mono italic">{tx.reference_type}</span>
                    <span className="text-[10px] text-gray-600 truncate max-w-[100px] ml-auto">ID: {tx.reference_id}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- TRANSACTION DETAIL MODAL --- */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-zinc-900/50">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-gray-500 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <DetailRow label="Transaction ID" value={selectedTx.id} isMono />
              <DetailRow label="Wallet Account" value={selectedTx.wallet_account_id} isMono />
              <DetailRow label="Amount" value={`${selectedTx.direction === 'in' ? '+' : '-'}${selectedTx.amount}`} highlight color={selectedTx.direction === 'in' ? 'text-green-400' : 'text-red-400'} />
              <DetailRow label="Type" value={selectedTx.type} isCapitalize />
              <DetailRow label="Status" value={selectedTx.status} />
              <DetailRow label="Created At" value={new Date(selectedTx.createdAt).toLocaleString()} />
              {selectedTx.idempotency_key && (
                <DetailRow label="Idempotency Key" value={selectedTx.idempotency_key} isMono />
              )}
            </div>

            <div className="p-4 bg-zinc-900/50 border-t border-gray-800 text-right">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-lg transition"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination View */}
      <div className="px-6 py-4 bg-zinc-900/50 border-t border-gray-800 flex items-center justify-between">
        <div className="text-[11px] text-gray-500 font-mono">
          PAGE <span className="text-gray-200">{pagination?.page || 1}</span> OF <span className="text-gray-200">{pagination?.totalPages || 1}</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-[11px] font-bold text-gray-400 hover:text-white disabled:opacity-30 uppercase tracking-widest">&lt; PREV</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= (pagination?.totalPages || 1)} className="text-[11px] font-bold text-gray-400 hover:text-white disabled:opacity-30 uppercase tracking-widest">NEXT &gt;</button>
        </div>
      </div>
    </div>
  );
};

// Reusable Detail Row Component
const DetailRow = ({ label, value, isMono = false, highlight = false, color = "text-gray-300", isCapitalize = false }: any) => (
  <div className="flex justify-between items-start border-b border-gray-800/50 pb-2">
    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
    <span className={`text-sm text-right break-all max-w-[250px] ${isMono ? 'font-mono' : ''} ${highlight ? 'text-xl font-bold' : color} ${isCapitalize ? 'capitalize' : ''}`}>
      {value || '---'}
    </span>
  </div>
);

export default WalletTransactionTable;