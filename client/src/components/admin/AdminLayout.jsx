import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  ShoppingBag,
  Truck,
  Users,
  Gift,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  FileText,
  LifeBuoy,
  UserPlus,
  Star,
  ClipboardList,
  MapPin,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  CreditCard,
  Lock,
  Globe,
  HelpCircle,
  BarChart3
} from 'lucide-react';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const topNavItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/riders', icon: Truck, label: 'Riders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/coupons', icon: Gift, label: 'Coupons' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin-login";
  };

  const getPageSidebar = () => {
    const path = location.pathname;

    if (path.startsWith('/admin/riders') || path.startsWith('/admin/delivery')) {
      return {
        title: 'Rider Management',
        icon: Truck,
        items: [
          { path: '/admin/riders', label: 'All Riders', icon: Users },
          { path: '/admin/riders/add', label: 'Add Rider', icon: UserPlus },
          { path: '/admin/delivery/assign', label: 'Assign Orders', icon: ClipboardList },
          { path: '/admin/delivery/track', label: 'Live Tracking', icon: MapPin },
        ]
      };
    }

    if (path.startsWith('/admin/customers')) {
      return {
        title: 'Customer Management',
        icon: Users,
        items: [
          { path: '/admin/customers', label: 'All Customers', icon: Users },
          { path: '/admin/customers/add', label: 'Add Customer', icon: UserPlus },
          { path: '/admin/customers/orders', label: 'Customer Orders', icon: ShoppingBag },
          { path: '/admin/customers/reviews', label: 'Reviews', icon: Star },
          { path: '/admin/customers/support', label: 'Support Tickets', icon: HelpCircle },
        ]
      };
    }

    if (path.startsWith('/admin/products')) {
      return {
        title: 'Product Management',
        icon: Package,
        items: [
          { path: '/admin/products', label: 'All Products', icon: Package },
          { path: '/admin/products/add', label: 'Add Product', icon: Plus },
          { path: '/admin/categories', label: 'Categories', icon: Tag },
          { path: '/admin/brands', label: 'Brands', icon: Building2 },
        ]
      };
    }

    if (path.startsWith('/admin/orders')) {
      return {
        title: 'Order Management',
        icon: ShoppingBag,
        items: [
          { path: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
          { path: '/admin/orders/pending', label: 'Pending', icon: Clock },
          { path: '/admin/orders/processing', label: 'Processing', icon: Package },
          { path: '/admin/orders/shipped', label: 'Shipped', icon: Truck },
          { path: '/admin/orders/delivered', label: 'Delivered', icon: CheckCircle },
          { path: '/admin/orders/cancelled', label: 'Cancelled', icon: XCircle },
        ]
      };
    }

    if (path.startsWith('/admin/coupons')) {
      return {
        title: 'Coupon Management',
        icon: Gift,
        items: [
          { path: '/admin/coupons', label: 'All Coupons', icon: Gift },
          { path: '/admin/coupons/add', label: 'Create Coupon', icon: Plus },
          { path: '/admin/coupons/active', label: 'Active Coupons', icon: CheckCircle },
          { path: '/admin/coupons/expired', label: 'Expired Coupons', icon: Clock },
        ]
      };
    }

    if (path.startsWith('/admin/reports')) {
      return {
        title: 'Reports',
        icon: FileText,
        items: [
          { path: '/admin/reports/sales', label: 'Sales Report', icon: TrendingUp },
          { path: '/admin/reports/inventory', label: 'Inventory', icon: Package },
          { path: '/admin/reports/customers', label: 'Customers', icon: Users },
        ]
      };
    }

    if (path.startsWith('/admin/settings')) {
      return {
        title: 'Settings',
        icon: Settings,
        items: [
          { path: '/admin/settings/general', label: 'General', icon: Settings },
          { path: '/admin/settings/payment', label: 'Payment', icon: CreditCard },
          { path: '/admin/settings/delivery', label: 'Delivery', icon: Truck },
          { path: '/admin/settings/notifications', label: 'Notifications', icon: Bell },
          { path: '/admin/settings/security', label: 'Security', icon: Lock },
          { path: '/admin/settings/seo', label: 'SEO', icon: Globe },
        ]
      };
    }

    return null;
  };

  const pageSidebar = getPageSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-lg font-bold text-gray-800 hidden md:block">K-TECH Admin</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white p-4 shadow-lg">
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <div className="flex">
        {pageSidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] flex-shrink-0 sticky top-[64px] overflow-y-auto">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <pageSidebar.icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm">{pageSidebar.title}</h2>
                  <p className="text-xs text-gray-400">Manage your store</p>
                </div>
              </div>
            </div>

            <nav className="p-3">
              {pageSidebar.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active
                      ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-400">K-TECH v1.0.0</p>
            </div>
          </aside>
        )}

        <main className={`flex-1 p-6 ${pageSidebar ? '' : 'max-w-7xl mx-auto'}`}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span className="text-gray-400">Admin</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">
              {pageSidebar?.title || 'Dashboard'}
            </span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;