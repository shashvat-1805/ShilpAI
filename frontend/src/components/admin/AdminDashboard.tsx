import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  Shield, CheckCircle2, XCircle, RefreshCw, Activity,
  Users, Package, ShoppingCart, Clock, AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'users' | 'health' | 'audit'>('users');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uData, hData, aData] = await Promise.all([
        api.getAllUsers(),
        api.getSystemHealth(),
        api.getAuditLogs()
      ]);
      setUsers(uData);
      setHealth(hData);
      setAuditLogs(aData);
    } catch (err) {
      console.warn('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (userId: number) => {
    try {
      await api.verifyArtisan(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: true } : u));
      alert('Artisan credentials verified and badge issued.');
    } catch (err: any) {
      alert('Verification failed: ' + err.message);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await api.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.is_active } : u));
    } catch (err: any) {
      alert('Status change failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#23211E] to-[#1F3F2E] rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs text-emerald-200 mb-3 border border-white/20">
            <Shield className="w-3.5 h-3.5" /> Platform Governance & Moderation
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-emerald-100 mt-2 max-w-xl">
            Inspect verification queues, system health, audit logs, and account statuses.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Admin Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E2D8] gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors ${activeTab === 'users' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#5C5852]'}`}
        >
          User & Artisan Verification ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 transition-colors ${activeTab === 'health' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#5C5852]'}`}
        >
          System Health & Metrics
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors ${activeTab === 'audit' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#5C5852]'}`}
        >
          Audit History Logs ({auditLogs.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C85A32]" />
          <span>Loading governance records...</span>
        </div>
      ) : activeTab === 'users' ? (
        
        /* Users & Verification Table */
        <div className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#8C827A] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Details / Craft</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#23211E]">{u.full_name}</p>
                      <p className="text-[11px] text-[#8C827A]">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E2D8]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-[#5C5852]">
                      {u.craft_or_org || 'Standard Profile'}
                    </td>
                    <td className="p-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${u.is_active ? 'text-emerald-700' : 'text-red-600'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!u.is_verified && (
                        <button
                          onClick={() => handleVerify(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#2D5A43] hover:bg-[#1F3F2E] text-white text-[10px] font-bold shadow-xs"
                        >
                          Verify Artisan
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          u.is_active
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : activeTab === 'health' && health ? (
        
        /* Health Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <span className="text-[10px] font-bold text-[#8C827A] uppercase block mb-1">Database State</span>
            <p className="text-xl font-bold font-serif text-emerald-800">{health.database_status}</p>
            <p className="text-[10px] text-[#8C827A] mt-1">Uptime: {health.uptime_seconds}s</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <span className="text-[10px] font-bold text-[#8C827A] uppercase block mb-1">Total Users</span>
            <p className="text-2xl font-bold font-serif text-[#23211E]">{health.total_users}</p>
            <p className="text-[10px] text-[#8C827A] mt-1">{health.total_artisans} Artisans • {health.total_buyers} Buyers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <span className="text-[10px] font-bold text-[#8C827A] uppercase block mb-1">Catalog Listings</span>
            <p className="text-2xl font-bold font-serif text-[#C85A32]">{health.total_products}</p>
            <p className="text-[10px] text-[#8C827A] mt-1">With Digital QR Passports</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <span className="text-[10px] font-bold text-[#8C827A] uppercase block mb-1">Confirmed Orders</span>
            <p className="text-2xl font-bold font-serif text-[#2D5A43]">{health.total_orders}</p>
            <p className="text-[10px] text-[#8C827A] mt-1">Production allocations active</p>
          </div>
        </div>

      ) : (

        /* Audit Logs Table */
        <div className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#8C827A] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5]/80">
                    <td className="p-4 font-mono font-bold text-[#C85A32]">{log.action}</td>
                    <td className="p-4 text-[#5C5852]">{log.resource_type} #{log.resource_id}</td>
                    <td className="p-4 text-[#23211E]">{log.details}</td>
                    <td className="p-4 text-[#8C827A]">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </div>
  );
};
