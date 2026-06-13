import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, Truck, Phone, Car, Bike as Motorcycle,
  Navigation, Star, X, Check, AlertCircle, Building2, Tag, Layers,
  CreditCard, Bell, Lock, Globe, Share2, Package, Users, Gift,
  Settings, Grid3x3, List, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';

const AdminRidersPage = () => {
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeSettingsTab, setActiveSettingsTab] = useState('riders');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    id_number: '',
    vehicle_type: 'motorcycle',
    vehicle_registration: '',
    license_number: '',
    is_available: true,
    is_active: true
  });

  const itemsPerPage = 9;

  const settingsMenu = [
    { id: 'riders', label: 'Riders', icon: Truck, description: 'Manage delivery riders' },
    { id: 'orders', label: 'Orders', icon: Package, description: 'Manage customer orders' },
    { id: 'customers', label: 'Customers', icon: Users, description: 'Manage customer accounts' },
    { id: 'coupons', label: 'Coupons', icon: Gift, description: 'Manage discount coupons' },
    { id: 'brands', label: 'Brands', icon: Building2, description: 'Manage product brands' },
    { id: 'categories', label: 'Categories', icon: Tag, description: 'Manage product categories' },
    { id: 'delivery', label: 'Delivery', icon: Truck, description: 'Configure delivery fees' },
    { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Payment methods & settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & SMS notifications' },
    { id: 'security', label: 'Security', icon: Lock, description: 'Security & access control' },
    { id: 'seo', label: 'SEO', icon: Globe, description: 'Search engine optimization' },
    { id: 'social-media', label: 'Social Media', icon: Share2, description: 'Social media integration' },
  ];

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getRiders();
      setRiders(res.data);
    } catch (err) {
      toast.error('Failed to load riders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingRider) {
        await adminAPI.updateRider(editingRider.id, formData);
        toast.success('Rider updated successfully');
      } else {
        await adminAPI.createRider(formData);
        toast.success('Rider created successfully');
      }
      closeModal();
      fetchRiders();
    } catch (err) {
      toast.error(editingRider ? 'Failed to save rider' : 'Failed to create rider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await adminAPI.deleteRider(id);
      toast.success('Rider deleted successfully');
      setShowDeleteConfirm(null);
      fetchRiders();
    } catch (err) {
      toast.error('Failed to delete rider');
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'motorcycle': return <Motorcycle className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      default: return <Truck className="w-5 h-5" />;
    }
  };

  const openModal = (rider = null) => {
    if (rider) {
      setEditingRider(rider);
      setFormData({
        full_name: rider.full_name,
        phone: rider.phone,
        id_number: rider.id_number,
        vehicle_type: rider.vehicle_type,
        vehicle_registration: rider.vehicle_registration,
        license_number: rider.license_number,
        is_available: rider.is_available,
        is_active: rider.is_active
      });
    } else {
      setEditingRider(null);
      setFormData({
        full_name: '',
        phone: '',
        id_number: '',
        vehicle_type: 'motorcycle',
        vehicle_registration: '',
        license_number: '',
        is_available: true,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRider(null);
    setFormData({
      full_name: '',
      phone: '',
      id_number: '',
      vehicle_type: 'motorcycle',
      vehicle_registration: '',
      license_number: '',
      is_available: true,
      is_active: true
    });
  };

  const filteredRiders = riders.filter(rider => {
    const matchesSearch = rider.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && rider.is_active) ||
      (filterStatus === 'inactive' && !rider.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage);
  const paginatedRiders = filteredRiders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const activeCount = riders.filter(r => r.is_active).length;
  const availableCount = riders.filter(r => r.is_available && r.is_active).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const ActiveIcon = settingsMenu.find(m => m.id === activeSettingsTab)?.icon || Truck;

  const renderRidersContent = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Delivery Riders</h2>
          <p className="text-gray-500 text-sm">Manage your delivery team</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition">
          <Plus className="w-4 h-4" />
          Add Rider
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Total Riders</p>
          <p className="text-xl font-bold text-gray-800">{riders.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-600">Available</p>
          <p className="text-xl font-bold text-green-700">{availableCount}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-blue-600">Active</p>
          <p className="text-xl font-bold text-blue-700">{activeCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search riders by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={fetchRiders} className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRiders.map((rider) => (
                <motion.div key={rider.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {getVehicleIcon(rider.vehicle_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{rider.full_name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{rider.rating || 5.0}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rider.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {rider.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-gray-400" /><span className="text-gray-600">{rider.phone}</span></div>
                    <div className="flex items-center gap-2"><Navigation className="w-3 h-3 text-gray-400" /><span className="text-gray-600">{rider.vehicle_registration}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rider.is_available ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {rider.is_available ? 'Available' : 'On Delivery'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(rider)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setShowDeleteConfirm(rider.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedRiders.map((rider) => (
                <div key={rider.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getVehicleIcon(rider.vehicle_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><span className="font-medium text-gray-800">{rider.full_name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${rider.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{rider.is_active ? 'Active' : 'Inactive'}</span></div>
                      <p className="text-xs text-gray-500">{rider.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(rider)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setShowDeleteConfirm(rider.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="w-72 bg-white border-r border-gray-200 min-h-screen flex-shrink-0">
          <div className="p-6 border-b border-gray-200"><h2 className="text-lg font-bold text-gray-800">Configure your store</h2><p className="text-sm text-gray-500 mt-1">Settings Menu</p><p className="text-xs text-gray-400 mt-2">Select a section to configure</p></div>
          <nav className="p-3">
            {settingsMenu.map((item) => {
              const Icon = item.icon;
              const isActive = activeSettingsTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${isActive ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="flex-1"><p className={`font-medium text-sm ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>{item.label}</p><p className="text-xs text-gray-400">{item.description}</p></div>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><ActiveIcon className="w-5 h-5 text-primary-600" /></div>
              <div><h1 className="text-2xl font-bold text-gray-800">{settingsMenu.find(m => m.id === activeSettingsTab)?.label}</h1><p className="text-gray-500 text-sm">{settingsMenu.find(m => m.id === activeSettingsTab)?.description}</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {activeSettingsTab === 'riders' ? renderRidersContent() : <div className="text-center py-12"><p className="text-gray-500">Configure {settingsMenu.find(m => m.id === activeSettingsTab)?.label} settings here</p></div>}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">{editingRider ? 'Edit Rider' : 'Add Rider'}</h2><button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label><input type="text" value={formData.id_number} onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label><select value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl"><option value="motorcycle">Motorcycle</option><option value="car">Car</option><option value="truck">Truck</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label><input type="text" value={formData.vehicle_registration} onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">License Number</label><input type="text" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl" /></div>
                <div className="flex gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" /><span className="text-sm text-gray-700">Available</span></label><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" /><span className="text-sm text-gray-700">Active</span></label></div>
                <div className="flex gap-3 pt-4"><button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">{editingRider ? 'Update' : 'Add Rider'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div><h2 className="text-lg font-bold text-gray-800">Delete Rider?</h2></div>
              <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3"><button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button><button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Delete</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRidersPage;