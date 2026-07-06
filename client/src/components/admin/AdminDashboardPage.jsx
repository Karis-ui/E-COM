// src/pages/admin/AdminDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    Package,
    Truck,
    DollarSign,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    RefreshCw,
    Clock,
    AlertCircle,
    ChevronRight,
    Target,
    LayoutDashboard,
    Tag,
    Building2,
    Gift,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    CreditCard,
    Bell,
    Lock,
    Globe,
    Share2,
    Home
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        revenue: { total: 0, today: 0, this_month: 0 },
        orders: { total: 0, pending: 0, processing: 0, shipped: 0 },
        customers: { total: 0, new_this_month: 0 },
        products: { total: 0, low_stock: 0, out_of_stock: 0 },
        recent_orders: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [dateRange, setDateRange] = useState('30');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({});
    const location = useLocation();

    // Navigation Menu Items
    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        {
            icon: Package,
            label: 'Products',
            subItems: [
                { path: '/admin/products', label: 'All Products' },
                { path: '/admin/products/add', label: 'Add Product' },
            ]
        },
        { path: '/admin/categories', icon: Tag, label: 'Categories' },
        { path: '/admin/brands', icon: Building2, label: 'Brands' },
        {
            icon: ShoppingBag,
            label: 'Orders',
            subItems: [
                { path: '/admin/orders', label: 'All Orders' },
                { path: '/admin/orders/pending', label: 'Pending' },
                { path: '/admin/orders/processing', label: 'Processing' },
            ]
        },
        {
            icon: Truck,
            label: 'Delivery',
            subItems: [
                { path: '/admin/riders', label: 'Riders' },
                { path: '/admin/delivery/assign', label: 'Assign Order' },
            ]
        },
        { path: '/admin/customers', icon: Users, label: 'Customers' },
        { path: '/admin/coupons', icon: Gift, label: 'Coupons' },
        {
            icon: Settings,
            label: 'Settings',
            subItems: [
                { path: '/admin/settings/general', label: 'General' },
                { path: '/admin/settings/payment', label: 'Payment' },
                { path: '/admin/settings/delivery', label: 'Delivery' },
                { path: '/admin/settings/notifications', label: 'Notifications' },
                { path: '/admin/settings/security', label: 'Security' },
                { path: '/admin/settings/seo', label: 'SEO' },
            ]
        },
    ];

    const toggleMenu = (label) => {
        setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [statsRes, salesRes, productsRes, ordersRes] = await Promise.all([
                adminAPI.getDashboardStats(),
                adminAPI.getSalesChart(dateRange),
                adminAPI.getTopProducts(5),
                adminAPI.getRecentOrders(10)
            ]);
            setStats({
                revenue: {
                    total: statsRes.data?.revenue?.total || 100,
                    today: statsRes.data?.revenue?.today || 30,
                    this_month: statsRes.data?.revenue?.this_month || 50
                },
                orders: {
                    total: statsRes.data?.orders?.total || 120,
                    pending: statsRes.data?.orders?.pending || 10,
                    processing: statsRes.data?.orders?.processing || 30,
                    shipped: statsRes.data?.orders?.shipped || 20
                },
                customers: {
                    total: statsRes.data?.customers?.total || 200,
                    new_this_month: statsRes.data?.customers?.new_this_month || 50
                },
                products: {
                    total: statsRes.data?.products?.total || 200,
                    low_stock: statsRes.data?.products?.low_stock || 10,
                    out_of_stock: statsRes.data?.products?.out_of_stock || 4
                },
                recent_orders: statsRes.data?.recent_orders || []
            });
            setSalesData(Array.isArray(salesRes.data) ? salesRes.data : []);
            setTopProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        } catch (err) {
            toast.error('Failed to load dashboard stats');
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-1">
                    {trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trendValue}% from last month
                    </span>
                </div>
            )}
        </motion.div>
    );

    if (isLoading) return <LoadingSpinner fullScreen />;

    const displayChartData = salesData.length > 0 ? salesData : [
        { date: 'Day 1', revenue: 0 },
        { date: 'Day 2', revenue: 0 },
        { date: 'Day 3', revenue: 0 },
        { date: 'Day 4', revenue: 0 },
        { date: 'Day 5', revenue: 0 },
        { date: 'Day 6', revenue: 0 },
        { date: 'Day 7', revenue: 0 }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* SIDEBAR */}
            <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-50 shadow-2xl ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
                {/* Logo */}
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    {isSidebarOpen ? (
                        <Link to="/admin" className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                            K-TECH Admin
                        </Link>
                    ) : (
                        <Link to="/admin" className="text-xl font-bold text-primary-400">K</Link>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 rounded-lg hover:bg-gray-700 transition"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {navItems.map((item, idx) => (
                        <div key={idx}>
                            {item.subItems ? (
                                <>
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-700/50 ${expandedMenus[item.label] ? 'bg-gray-700/30' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5" />
                                            {isSidebarOpen && <span>{item.label}</span>}
                                        </div>
                                        {isSidebarOpen && (
                                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenus[item.label] ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                    {expandedMenus[item.label] && isSidebarOpen && (
                                        <div className="pl-12">
                                            {item.subItems.map((subItem, subIdx) => (
                                                <Link
                                                    key={subIdx}
                                                    to={subItem.path}
                                                    className={`flex items-center gap-3 px-5 py-2 text-sm transition-colors hover:bg-gray-700/50 ${isActive(subItem.path) ? 'bg-primary-600 text-white' : 'text-gray-300'}`}
                                                >
                                                    <span>{subItem.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-700/50 ${isActive(item.path) ? 'bg-primary-600 text-white' : ''}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="border-t border-gray-700 p-4">
                    <button
                        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                        className="flex items-center gap-3 w-full px-5 py-3 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition"
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
                <div className="p-6">
                    {/* Dashboard Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                                    Dashboard
                                </h1>
                                <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={fetchDashboardData}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition">
                                    <Download className="w-4 h-4" />
                                    Export Report
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Revenue"
                            value={formatCurrency(stats?.revenue?.total || 0)}
                            icon={DollarSign}
                            trend="up"
                            trendValue="12.5"
                            color="bg-gradient-to-r from-green-500 to-green-600"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats?.orders?.total || 0}
                            icon={ShoppingBag}
                            trend="up"
                            trendValue="8.2"
                            color="bg-gradient-to-r from-blue-500 to-blue-600"
                        />
                        <StatCard
                            title="Total Customers"
                            value={stats?.customers?.total || 0}
                            icon={Users}
                            trend="up"
                            trendValue="15.3"
                            color="bg-gradient-to-r from-purple-500 to-purple-600"
                        />
                        <StatCard
                            title="Total Products"
                            value={stats?.products?.total || 0}
                            icon={Package}
                            trend="up"
                            trendValue="5.1"
                            color="bg-gradient-to-r from-orange-500 to-orange-600"
                        />
                    </div>

                    {/* Today's Highlights */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-primary-100 text-sm">Today's Revenue</p>
                                    <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.revenue?.today || 0)}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-primary-100">
                                <Clock className="w-4 h-4" />
                                <span>Updated just now</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-orange-100 text-sm">Pending Orders</p>
                                    <p className="text-2xl font-bold mt-1">{stats?.orders?.pending || 0}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-orange-100">
                                <AlertCircle className="w-4 h-4" />
                                <span>Requires attention</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-red-100 text-sm">Low Stock</p>
                                    <p className="text-2xl font-bold mt-1">{stats?.products?.low_stock || 0}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-red-100">
                                <Package className="w-4 h-4" />
                                <span>Products below threshold</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-green-100 text-sm">Out for Delivery</p>
                                    <p className="text-2xl font-bold mt-1">{stats?.orders?.shipped || 0}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Truck className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-100">
                                <Target className="w-4 h-4" />
                                <span>In transit to customers</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Revenue Overview</h3>
                                    <p className="text-sm text-gray-500">Daily sales for the last {dateRange} days</p>
                                </div>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                </select>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={displayChartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                        fill="url(#colorRevenue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Selling Products</h3>
                            {topProducts && topProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {topProducts.map((product, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600">
                                                #{idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-gray-500">Sold: {product.total_sold || 0} units</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary-600 text-sm">{formatCurrency(product.regular_price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No product data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                                <p className="text-sm text-gray-500">Latest customer orders</p>
                            </div>
                            <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                                View all orders
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders && recentOrders.length > 0 ? (
                                        recentOrders.map((order, idx) => {
                                            const statusColors = {
                                                pending: 'bg-yellow-100 text-yellow-800',
                                                processing: 'bg-blue-100 text-blue-800',
                                                packed: 'bg-purple-100 text-purple-800',
                                                shipped: 'bg-indigo-100 text-indigo-800',
                                                delivered: 'bg-green-100 text-green-800',
                                                cancelled: 'bg-red-100 text-red-800',
                                            };
                                            const statusText = {
                                                pending: 'Pending',
                                                processing: 'Processing',
                                                packed: 'Packed',
                                                shipped: 'Shipped',
                                                delivered: 'Delivered',
                                                cancelled: 'Cancelled',
                                            };
                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                        #{order.order_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {order.customer_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                                        {formatCurrency(order.total)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                                                            {statusText[order.status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Link to={`/admin/orders/${order.id}`} className="text-primary-600 hover:text-primary-700">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No recent orders
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;