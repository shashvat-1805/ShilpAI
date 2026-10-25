import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Order } from '../../types';
import {
  Package, Truck, CheckCircle2, Clock, AlertCircle, ArrowRight,
  ShieldCheck, RefreshCw, Send, MapPin, Eye
} from 'lucide-react';

export const OrdersTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Milestone advance state
  const [newStage, setNewStage] = useState<string>('in_production');
  const [milestoneTitle, setMilestoneTitle] = useState<string>('');
  const [milestoneNotes, setMilestoneNotes] = useState<string>('');
  const [advancing, setAdvancing] = useState<boolean>(false);

  // Shipment state
  const [carrier, setCarrier] = useState<string>('India Post Speed Post');
  const [trackingNumber, setTrackingNumber] = useState<string>('EK983210492IN');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getMyOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAdvanceMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setAdvancing(true);
    try {
      const updated = await api.advanceMilestone(
        selectedOrder.id,
        newStage,
        milestoneTitle || `Stage reached: ${newStage.replace('_', ' ').toUpperCase()}`,
        milestoneNotes
      );
      setSelectedOrder(updated);
      setMilestoneNotes('');
      setMilestoneTitle('');
      await fetchOrders();
    } catch (err: any) {
      alert('Failed to update milestone: ' + err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.updateShipment(selectedOrder.id, carrier, trackingNumber);
      alert('Shipment dispatch registered successfully!');
      await fetchOrders();
    } catch (err: any) {
      alert('Failed to update shipment: ' + err.message);
    }
  };

  const STAGES = [
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'in_production', label: 'In Production' },
    { key: 'qc_completed', label: 'QC Inspected' },
    { key: 'packaged', label: 'Packaged' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C85A32] to-[#8C3415] rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
            <Package className="w-3.5 h-3.5 text-amber-200" /> Module I: Order Fulfillment & Milestone Tracker
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {t('nav.orders')}
          </h1>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Track transparent production allocations, quality control, packaging checklists, and courier tracking updates.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C85A32]" />
          <span>Loading orders and production tracking...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#8C827A]">
          No orders active at this time. When buyers accept quotations or place wholesale orders, they appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Order List Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#23211E] uppercase tracking-wider">
              Active Orders ({orders.length})
            </h3>
            <div className="space-y-2">
              {orders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#C85A32] bg-[#F7EAE4]/60 shadow-xs ring-1 ring-[#C85A32]/30'
                        : 'border-[#E8E2D8] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-[#23211E]">{o.order_number}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EBF2EE] text-[#2D5A43]">
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-semibold text-[#5C5852]">{o.buyer_name || 'Wholesale Buyer'}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#8C827A] mt-2">
                      <span>Total: <strong className="text-[#C85A32]">₹{o.total_amount.toLocaleString()}</strong></span>
                      <span>{new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Order Detail & Milestones */}
          {selectedOrder && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Header Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#F2ECE1] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#C85A32]">Order Details</span>
                    <h2 className="font-serif text-xl font-bold text-[#23211E]">{selectedOrder.order_number}</h2>
                    <p className="text-xs text-[#5C5852]">Buyer: <strong>{selectedOrder.buyer_name}</strong></p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#8C827A] block">Total Order Value</span>
                    <span className="font-serif text-2xl font-bold text-[#C85A32]">₹{selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#23211E]">Order Items:</h4>
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs">
                      <div>
                        <span className="font-semibold text-[#23211E]">{it.product_title}</span>
                        <p className="text-[10px] text-[#8C827A]">Quantity: {it.quantity} units @ ₹{it.unit_price} / unit</p>
                      </div>
                      <span className="font-bold text-[#23211E]">₹{it.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Destination */}
                <div className="flex items-start gap-2 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8]">
                  <MapPin className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#23211E]">Delivery Address:</span>
                    <p className="text-[#5C5852] mt-0.5">{selectedOrder.delivery_address}</p>
                  </div>
                </div>

                {/* Milestone Stepper Visualizer */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-[#23211E] mb-3">Milestone Progress Pipeline:</h4>
                  <div className="flex items-center justify-between relative overflow-x-auto pb-2">
                    {STAGES.map((stg, i) => {
                      const isCompleted = selectedOrder.milestones.some(m => m.stage === stg.key);
                      const isCurrent = selectedOrder.status === stg.key;
                      return (
                        <div key={stg.key} className="flex flex-col items-center min-w-[70px] text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-[#C85A32] text-white ring-4 ring-[#F7EAE4]'
                              : 'bg-[#E8E2D8] text-[#8C827A]'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className={`text-[10px] mt-1 font-medium ${isCurrent ? 'font-bold text-[#C85A32]' : 'text-[#8C827A]'}`}>
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone History Log */}
                <div className="space-y-2 pt-2 border-t border-[#F2ECE1]">
                  <h4 className="text-xs font-bold text-[#23211E]">Completed Milestones:</h4>
                  <div className="space-y-1.5">
                    {selectedOrder.milestones.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs">
                        <div className="flex items-center justify-between font-semibold text-[#23211E]">
                          <span className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {m.title}
                          </span>
                          <span className="text-[10px] text-[#8C827A] font-normal">
                            {new Date(m.completed_at).toLocaleString()}
                          </span>
                        </div>
                        {m.notes && <p className="text-[11px] text-[#5C5852] mt-1 pl-5">{m.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advance Milestone Form (Artisan / Admin action) */}
                {(currentUser?.role === 'artisan' || currentUser?.role === 'admin') && (
                  <form onSubmit={handleAdvanceMilestone} className="p-4 rounded-xl bg-[#F7EAE4]/50 border border-[#C85A32]/30 space-y-3">
                    <h4 className="text-xs font-bold text-[#A44321] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Advance Production Milestone:
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#23211E] mb-1">Target Stage</label>
                        <select
                          value={newStage}
                          onChange={(e) => setNewStage(e.target.value)}
                          className="w-full p-2 border border-[#E8E2D8] rounded-lg text-xs bg-white font-medium"
                        >
                          <option value="in_production">In Production (बुनाई/शिल्प निर्माण चालू)</option>
                          <option value="qc_completed">Quality Checked & Inspected (गुणवत्ता जांच पूर्ण)</option>
                          <option value="packaged">Packaged with QR Passport (सुरक्षित पैकेजिंग तैयार)</option>
                          <option value="dispatched">Dispatched to Courier (कूरियर को सौंपा)</option>
                          <option value="delivered">Delivered to Buyer (सफलतापूर्वक सुपुर्द)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#23211E] mb-1">Milestone Title</label>
                        <input
                          type="text"
                          value={milestoneTitle}
                          onChange={(e) => setMilestoneTitle(e.target.value)}
                          placeholder="e.g. 20 Units Passed 3-Tier QC Inspection"
                          className="w-full p-2 border border-[#E8E2D8] rounded-lg text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#23211E] mb-1">Status Notes</label>
                      <input
                        type="text"
                        value={milestoneNotes}
                        onChange={(e) => setMilestoneNotes(e.target.value)}
                        placeholder="e.g. Warp completed, tested gold zari inspected, zero defects found."
                        className="w-full p-2 border border-[#E8E2D8] rounded-lg text-xs bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={advancing}
                      className="px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#A44321] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Update Milestone & Notify Buyer
                    </button>
                  </form>
                )}

                {/* Shipment Tracker Form */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#23211E] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#2D5A43]" /> Courier Dispatch & Live Tracking:
                    </h4>
                    {selectedOrder.shipment && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {selectedOrder.shipment.current_status}
                      </span>
                    )}
                  </div>

                  {selectedOrder.shipment ? (
                    <div className="p-3 bg-white rounded-xl border border-[#E8E2D8] text-xs space-y-1">
                      <p>Carrier: <strong>{selectedOrder.shipment.carrier_name}</strong></p>
                      <p>Tracking Number: <strong className="font-mono text-[#C85A32]">{selectedOrder.shipment.tracking_number}</strong></p>
                      <p className="text-[11px] text-[#8C827A]">Estimated Delivery: {selectedOrder.shipment.estimated_delivery}</p>
                    </div>
                  ) : (
                    (currentUser?.role === 'artisan' || currentUser?.role === 'admin') && (
                      <form onSubmit={handleUpdateShipment} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          placeholder="Courier / Carrier"
                          className="p-2 border border-[#E8E2D8] rounded-lg text-xs bg-white"
                        />
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Tracking Number"
                          className="p-2 border border-[#E8E2D8] rounded-lg text-xs bg-white"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 rounded-lg bg-[#2D5A43] text-white text-xs font-bold hover:bg-[#1F3F2E] transition-all"
                        >
                          Register Dispatch
                        </button>
                      </form>
                    )
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
