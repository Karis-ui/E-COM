import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tags,
  Building2,
  ShoppingCart,
  Truck,
  Users,
  Gift,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const AdminLayout = ()=>{
    const [isSidebarOpen,setIsSidebarOpen] = useState(true);
    const [expandedMenus,setExpandedMenus] = useState({});
    const location = useLocation();
    const dispatch = useDispatch();
    const toggleMeny = (menu)=>{
        setExpandedMenus(prev  =>({...prev,[menu]: !prev[menu]}));
    };

    const navItems = [
        {path:'/admin',icon:LayoutDashboard,label:'Dashboard',exact:true},
        {
            icon:Package,
            label:'Products',
            subItems:[
                {path:'/admin/products',label:'All Products',icon:Package},
                {path:'/admin/products/add',label:'Add Product',icon:PlusCircle},
                {path:'/admin/products/import',label:'Import Products',icon:Upload},
                {path:'/admin/products/export',label:'Export Products',icon:Download},
                {path:'/admin/inventory',label:'Inventory Stock',icon:AlertCircle},
            ]
        },

        {path:'/admin/categories',label:'Categories',icon:Tags},
        {path:'/admin/brands',label:'Brands',icon:Building2},
        {
            icon:ShoppingCart,
            label:'Orders',
            subItems:[
                {path:'/admin/orders',label:'All Orders'},
                {path:'/admin/orders/pending',label:'Pending Payments'},
                {path:'/admin/orders/processing',label:'Processing'},
                {path:'/admin/orders/shipped',label:'Shipped'},
                {path:'/admin/orders/delivered',label:'Delivered'},
                {path:'/admin/orders/cancelled',label:'Cancelled'},
            ]
        },
        {
            icon:Truck,
            label:'Delivery',
            subItems:[
                {path:'/admin/riders',label:'Riders'},
                {path:'/admin/delivery/assign',label:'Assign Order'},
                {path:'/admin/delivery/track',label:'Live Trcaking'},
            ]
        },
        {path:'/admin/customers',label:'Customers',icon:Users},
        {path:'/admin/coupons',label:'Coupons',icon:Gift},
        {
            icon:FileText,
            label:'Reports',
            subItems:[
                {path:'/admin/reports/sales',label:'Sales Report'},
                {path:'/admin/reports/inventory',label:'Inventory Report'},
                {path:'/admin/reports/customers',label:'Customer Report'},
            ]
        },
        {path:'/admin/settings',label:'Settings',icon:Settings},
    ];

    const isActive = (path)=>{
        if(path === '/admin'){
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = ()=>{
        dispatch(logout());
        window.location.href = '/';
    };

    return (
    <div className="min-h-screen bg-gray-100">
      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-50 shadow-2xl ${
        isSidebarOpen ? 'w-72' : 'w-20'
      }`}>
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
        
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item, idx) => (
            <div key={idx}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-700/50 ${
                      expandedMenus[item.label] ? 'bg-gray-700/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {isSidebarOpen && <span>{item.label}</span>}
                    </div>
                    {isSidebarOpen && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenus[item.label] ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedMenus[item.label] && isSidebarOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-12"
                      >
                        {item.subItems.map((subItem, subIdx) => (
                          <Link
                            key={subIdx}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-5 py-2 text-sm transition-colors hover:bg-gray-700/50 ${
                              isActive(subItem.path) ? 'bg-primary-600 text-white' : 'text-gray-300'
                            }`}
                          >
                            {subItem.icon && <subItem.icon className="w-4 h-4" />}
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-700/50 ${
                    isActive(item.path) ? 'bg-primary-600 text-white' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-3 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;