import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Users,
    ShoppingBag,
    Download,
    RefreshCw,
    Calendar,
    ChevronDown,
    BarChart3,
    PieChart,
    LineChart,
    FileText,
    Printer,
    Mail
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar
} from 'recharts';

const AdminReportsPage = () => {
    const location = useLocation();
    const [reportType, setReportType] = useState('sales');
    const [isLoading, setIsLoading] = useState(true);
    const [categoryData, setCategoryData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [dateRange, setDateRange] = useState('30');
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, totalCustomers: 0, growth: 0 });

    const reportTypeFromUrl = location.pathname.split('/').pop();
    const activeReport = (reportTypeFromUrl === 'reports' || reportTypeFromUrl === 'admin') ? 'sales' : reportTypeFromUrl;

    useEffect(() => {
        fetchReportData();
    }, [dateRange, activeReport]);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, sales, productRes, categoriesRes] = await Promise.all([
                adminAPI.getDashboardStats(),
                adminAPI.getSalesChart(dateRange),
                adminAPI.getTopProducts(10),
                adminAPI.getCategories()
            ]);

            setStats({
                totalRevenue: statsRes.data?.revenue?.total || 0,
                totalOrders: statsRes.data?.orders?.total || 0,
                averageOrderValue: statsRes.data?.orders?.total ? statsRes.data?.revenue?.total / statsRes.data?.orders?.total : 0,
                totalCustomers: statsRes.data?.customers?.total || 0,
                growth: 12.5
            });
            setSalesData(salesData.data || []);
            setTopProducts(productRes.data || []);
            setCategoryData(categoriesRes.data || []);
        } catch (err) {
            toast.error('Failed to load report data. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const reportTabs = [
        { id: 'sales', label: 'Sales Report', icon: BarChart3 },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'customers', label: 'Customers', icon: Users },
    ];

    const COLORS = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'
    ];

    const renderSalesReport = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">+{stats.growth}% from last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Average Order Value</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.averageOrderValue)}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-800">Revenue Overview</h3>
                        <p className="text-sm text-gray-500">Daily sales for the last {dateRange} days</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                        <defs>
                            <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            fill="url(#reportRevenue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Top Products & Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4">Top Selling Products</h3>
                    <div className="space-y-3">
                        {topProducts.slice(0, 5).map((product, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600 text-sm">
                                    #{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-500">Sold: {product.total_sold || 0} units</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary-600 text-sm">{formatCurrency(product.regular_price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4">Sales by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <RePieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderInventoryReport = () => (
        <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Inventory Report</h3>
            <p className="text-gray-500">Inventory analytics coming soon</p>
        </div>
    );

    const renderCustomersReport = () => (
        <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Customer Report</h3>
            <p className="text-gray-500">Customer analytics coming soon</p>
        </div>
    );

    const renderContent = () => {
        switch (activeReport) {
            case 'sales': return renderSalesReport();
            case 'inventory': return renderInventoryReport();
            case 'customers': return renderCustomersReport();
            default: return renderSalesReport();
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                        Reports
                    </h1>
                    <p className="text-gray-500 mt-1">Analyze your store performance</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
                        <Mail className="w-4 h-4" />
                        Email Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex gap-1">
                {reportTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeReport === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setReportType(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition ${isActive
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default AdminReportsPage;