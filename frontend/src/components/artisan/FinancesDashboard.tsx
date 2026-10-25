import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  Landmark, TrendingUp, AlertTriangle, PlusCircle, Download,
  DollarSign, PieChart, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2
} from 'lucide-react';

export const FinancesDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New expense form state
  const [expenseType, setExpenseType] = useState<string>('material');
  const [amount, setAmount] = useState<number>(1500);
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const data = await api.getFinancialSummary();
      setSummary(data);
    } catch (err) {
      console.warn('Failed to load finances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;
    setSaving(true);
    try {
      await api.logExpense({
        expense_type: expenseType,
        amount,
        description
      });
      setShowAddModal(false);
      setDescription('');
      setAmount(1500);
      await fetchFinances();
    } catch (err: any) {
      alert('Error recording expense: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!summary) return;
    let csv = `Type,Amount (INR)\n`;
    csv += `Total Recorded Revenue,${summary.total_revenue}\n`;
    csv += `Total Recorded Expenses,${summary.total_expenses}\n`;
    csv += `Net Gross Profit,${summary.gross_profit}\n`;
    csv += `Gross Operating Margin %,${summary.gross_margin_pct}%\n\n`;
    csv += `Expense Breakdown Category,Amount (INR)\n`;
    Object.entries(summary.expenses_by_type || {}).forEach(([k, v]) => {
      csv += `${k.toUpperCase()},${v}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShilpAI_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4A359] to-[#A47124] rounded-2xl p-6 text-[#23211E] shadow-lg mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 text-xs font-bold backdrop-blur-xs mb-2">
            <Landmark className="w-3.5 h-3.5 text-[#23211E]" /> Module S: Financial Health Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {t('nav.finances')}
          </h1>
          <p className="text-xs text-[#3D3A35] mt-1 max-w-xl">
            Accurate revenue, material, and labor cost tracking ensuring artisan families earn fair wages and preserve healthy profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#23211E] text-white font-bold text-xs hover:bg-[#3D3A35] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#D4A359]" /> Log New Expense
          </button>
          <button
            onClick={handleDownloadCSV}
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-[#23211E] text-xs font-bold transition-all shadow-sm"
            title="Download Financial Report (CSV)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#D4A359]" />
          <span>Calculating accurate financial metrics...</span>
        </div>
      ) : summary && (
        <div className="space-y-6">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider block mb-1">
                Total Recorded Revenue
              </span>
              <p className="text-2xl font-serif font-bold text-[#23211E]">
                ₹{summary.total_revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> From wholesale & marketplace orders
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider block mb-1">
                Total Operating Expenses
              </span>
              <p className="text-2xl font-serif font-bold text-[#C85A32]">
                ₹{summary.total_expenses.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-[#A44321] font-semibold mt-1">
                <ArrowDownRight className="w-3.5 h-3.5" /> Raw materials, labor & transit
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider block mb-1">
                Net Gross Profit
              </span>
              <p className="text-2xl font-serif font-bold text-emerald-800">
                ₹{summary.gross_profit.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#8C827A] mt-1">Direct artisan household earnings</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider block mb-1">
                Gross Operating Margin
              </span>
              <p className={`text-2xl font-serif font-bold ${summary.gross_margin_pct >= 25 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {summary.gross_margin_pct}%
              </p>
              <p className="text-[10px] text-[#8C827A] mt-1">Target benchmark: 25% - 40%</p>
            </div>
          </div>

          {/* Low Margin Alerts */}
          {summary.low_margin_alerts && summary.low_margin_alerts.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Underpriced / Low Margin Products Detected:
              </h3>
              <div className="space-y-1.5">
                {summary.low_margin_alerts.map((al: any) => (
                  <div key={al.product_id} className="p-3 bg-white rounded-xl border border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#23211E]">{al.title}</span>
                      <p className="text-[#A44321] text-[11px]">{al.recommendation}</p>
                    </div>
                    <div className="text-right text-[11px] font-semibold text-[#8C827A]">
                      Current Margin: <span className="text-red-600 font-bold">{al.margin_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense Breakdown by Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-[#23211E] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#C85A32]" /> Expense Allocation Breakdown
              </h3>
              
              <div className="space-y-3 text-xs">
                {Object.entries(summary.expenses_by_type || {}).map(([type, val]: any) => {
                  const pct = summary.total_expenses > 0 ? ((val / summary.total_expenses) * 100).toFixed(0) : '0';
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="capitalize text-[#23211E]">{type} Expenses</span>
                        <span className="text-[#C85A32]">₹{val.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#F2ECE1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C85A32] to-[#D4A359] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Trend Overview */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-[#23211E] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2D5A43]" /> Monthly Cash Flow Trends
              </h3>
              
              <div className="grid grid-cols-4 gap-2 pt-4">
                {summary.monthly_trend && summary.monthly_trend.map((m: any) => (
                  <div key={m.month} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] text-center text-xs">
                    <span className="font-bold text-[#8C827A] block text-[10px] uppercase mb-1">{m.month}</span>
                    <span className="text-emerald-700 font-bold block text-sm">₹{(m.revenue / 1000).toFixed(1)}k</span>
                    <span className="text-[#C85A32] font-semibold block text-[10px] mt-0.5">₹{(m.expenses / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#EBF2EE] rounded-xl border border-[#2D5A43]/20 text-xs text-[#1F3F2E]">
                💡 <strong>Financial Advisor Insight:</strong> Your Q3 gross margin grew by 4.2% due to bulk yarn procurement savings. Keep recording packaging costs to claim ODOP transportation subsidies.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] rounded-2xl shadow-xl border border-[#E8E2D8] w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="font-serif font-bold text-lg text-[#23211E] mb-1">
              Record Operating Expense
            </h3>
            <p className="text-xs text-[#5C5852] mb-4">
              Log expenditures to maintain clean business records and calculate net profits.
            </p>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#23211E] mb-1">Expense Type</label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                  className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-white font-medium"
                >
                  <option value="material">Raw Material (Silk cones, clay, timber, dyes)</option>
                  <option value="labor">Artisan / Weaver Labor Wages</option>
                  <option value="packaging">Packaging Boxes & Cushioning Material</option>
                  <option value="transport">Freight, Courier & Local Transport</option>
                  <option value="overhead">Electricity, Tools, Loom Maintenance</option>
                  <option value="other">Other Operational Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#23211E] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-white font-bold text-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#23211E] mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 5kg mulberry silk yarn from district silk depot"
                  className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#5C5852]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#A44321] transition-all"
                >
                  {saving ? 'Saving...' : 'Save Expense Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
