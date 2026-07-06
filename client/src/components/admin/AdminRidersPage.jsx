import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Users,
  UserPlus,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Eye,
  Phone,
  Car,
  Bike,
  Navigation,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  ClipboardList,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';

const AdminRidersPage = () => {
  const location = useLocation();
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const itemsPerPage = 20;

  const isAddPage = location.pathname.includes('/add');
  const isAssignPage = location.pathname.includes('/assign');
  const isTrackPage = location.pathname.includes('/track');

  useEffect(() => {
    if (!isAddPage && !isAssignPage && !isTrackPage) {
      fetchRiders();
    }
  }, [filterStatus, currentPage, searchTerm]);

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

  const toggleRiderStatus = async (riderId, currentStatus) => {
    try {
      await adminAPI.updateRider(riderId, { is_active: !currentStatus });
      toast.success(currentStatus ? 'Rider deactivated' : 'Rider activated');
      fetchRiders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const toggleAvailability = async (riderId, currentAvailability) => {
    try {
      await adminAPI.updateRider(riderId, { is_available: !currentAvailability });
      toast.success(currentAvailability ? 'Rider marked unavailable' : 'Rider marked available');
      fetchRiders();
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (riderId) => {
    if (window.confirm('Are you sure you want to delete this rider?')) {
      try {
        await adminAPI.deleteRider(riderId);
        toast.success('Rider deleted successfully');
        fetchRiders();
      } catch (err) {
        toast.error('Failed to delete rider');
      }
    }
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'motorcycle': return <Bike className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      default: return <Truck className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' }
      : { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Inactive' };
  };

  const totalRiders = riders.length;
  const activeCount = riders.filter(r => r.is_active).length;
  const availableCount = riders.filter(r => r.is_available && r.is_active).length;

  if (isAddPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/admin/riders"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Rider</h1>
            <p className="text-gray-500 text-sm">Add a new delivery rider to your team</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="0712345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="KCM 123A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="LIC-123456"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 rounded"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">Available for delivery</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 rounded"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">Active account</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                to="/admin/riders"
                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
              >
                Add Rider
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAssignPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/admin/riders"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Assign Orders</h1>
            <p className="text-gray-500 text-sm">Assign delivery orders to available riders</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Assignment</h3>
            <p className="text-gray-500">Select an order and assign it to an available rider</p>
            <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition">
              View Pending Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTrackPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/admin/riders"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Live Tracking</h1>
            <p className="text-gray-500 text-sm">Track riders in real-time</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Live Tracking</h3>
            <p className="text-gray-500">View rider locations and deliveries in real-time</p>
            <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition">
              View Live Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
            Delivery Riders
          </h1>
          <p className="text-gray-500 mt-1">Manage your delivery team</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/riders/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Rider
          </Link>
          <button
            onClick={fetchRiders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Riders</p>
              <p className="text-2xl font-bold text-gray-800">{totalRiders}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 shadow-sm border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600">Available</p>
              <p className="text-2xl font-bold text-green-700">{availableCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600">Active</p>
              <p className="text-2xl font-bold text-blue-700">{activeCount}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchRiders()}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={fetchRiders}
              className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : riders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No riders found</h3>
          <p className="text-sm text-gray-500">Add a new rider to your delivery team</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riders.map((rider, idx) => {
            const statusBadge = getStatusBadge(rider.is_active);
            const StatusIcon = statusBadge.icon;
            return (
              <motion.div
                key={rider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {getVehicleIcon(rider.vehicle_type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{rider.full_name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{rider.rating || 5.0}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{rider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{rider.vehicle_registration || 'No vehicle'}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rider.is_available ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                      {rider.is_available ? 'Available' : 'On Delivery'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleAvailability(rider.id, rider.is_available)}
                        className={`p-1.5 rounded-lg transition ${rider.is_available
                          ? 'text-gray-400 hover:bg-gray-100'
                          : 'text-green-600 hover:bg-green-50'
                          }`}
                      >
                        {rider.is_available ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleRiderStatus(rider.id, rider.is_active)}
                        className={`p-1.5 rounded-lg transition ${rider.is_active
                          ? 'text-gray-400 hover:bg-gray-100'
                          : 'text-green-600 hover:bg-green-50'
                          }`}
                      >
                        {rider.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(rider.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRidersPage;