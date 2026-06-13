import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Truck,
    DollarSign,
    Mail,
    Shield,
    Globe,
    Smartphone,
    Building2,
    Bell,
    Lock,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Search,
    Image,
    Loader2,
    CreditCard,
    ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
    const [settings, setSettings] = useState({
        delivery: {
            nairobi: 300,
            other: 500,
            free_threshold: 10000
        },
        shop: {
            name: 'K-TECH Electronics',
            email: 'info@ktech.co.ke',
            phone: '+254 700 123 456',
            address: 'Nairobi, Kenya',
            logo: '',
            favicon: ''
        },
        notifications: {
            order_notifications: true,
            low_stock_notifications: true,
            customer_review_notifications: true,
            notification_email: ''
        },
        payment: {
            mpesa_enabled: true,
            card_enabled: true,
            cash_enabled: true
        },
        security: {
            two_factor_auth: false,
            session_timeout: 60
        },
        seo: {
            meta_title: '',
            meta_description: '',
            meta_keywords: ''
        },
        social: {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: ''
        }
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('delivery');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getSettings();
            setSettings(response.data);
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeliveryChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            delivery: { ...prev.delivery, [key]: parseFloat(value) || 0 }
        }));
    };

    const handleShopChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            shop: { ...prev.shop, [key]: value }
        }));
    };

    const handleNotificationChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: value }
        }));
    };

    const handlePaymentChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            payment: { ...prev.payment, [key]: value }
        }));
    };

    const handleSecurityChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            security: { ...prev.security, [key]: value }
        }));
    };

    const handleSEOChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            seo: { ...prev.seo, [key]: value }
        }));
    };

    const handleSocialChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            social: { ...prev.social, [key]: value }
        }));
    };

    const updateSection = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: { ...prev[section], [key]: value }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await adminAPI.updateSettings(settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'shop', label: 'Shop Info', icon: Building2 },
        { id: 'payment', label: 'Payment', icon: DollarSign },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'seo', label: 'SEO', icon: Search },
        { id: 'social', label: 'Social Media', icon: Globe },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Configure your store settings</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800">Settings Menu</h2>
                            <p className="text-xs text-gray-500 mt-1">Select a section to configure</p>
                        </div>
                        <nav className="p-2">
                            {tabs.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 mb-1 ${isActive
                                            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-sm font-medium ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>
                                                    {section.label}
                                                </p>
                                                <p className="text-xs text-gray-400 hidden lg:block">{section.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="flex-1">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-sm p-6"
                    >
                        {activeSection === 'delivery' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Delivery Settings</h2>
                                        <p className="text-sm text-gray-500">Configure delivery fees and zones</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Fee - Nairobi (KSh)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.delivery.nairobi}
                                            onChange={(e) => updateSection('delivery', 'nairobi', parseInt(e.target.value))}
                                            className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Fee - Other Counties (KSh)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.delivery.other}
                                            onChange={(e) => updateSection('delivery', 'other', parseInt(e.target.value))}
                                            className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Free Delivery Threshold (KSh)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.delivery.free_threshold}
                                            onChange={(e) => updateSection('delivery', 'free_threshold', parseInt(e.target.value))}
                                            className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Orders above this amount get free delivery
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'shop' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Shop Information</h2>
                                        <p className="text-sm text-gray-500">Basic store information</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                        <input
                                            type="text"
                                            value={settings.shop.name}
                                            onChange={(e) => updateSection('shop', 'name', e.target.value)}
                                            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Email</label>
                                        <input
                                            type="email"
                                            value={settings.shop.email}
                                            onChange={(e) => updateSection('shop', 'email', e.target.value)}
                                            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Phone</label>
                                        <input
                                            type="text"
                                            value={settings.shop.phone}
                                            onChange={(e) => updateSection('shop', 'phone', e.target.value)}
                                            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                                        <textarea
                                            value={settings.shop.address}
                                            onChange={(e) => updateSection('shop', 'address', e.target.value)}
                                            rows="2"
                                            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                        <input
                                            type="url"
                                            value={settings.shop.logo}
                                            onChange={(e) => updateSection('shop', 'logo', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'payment' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
                                        <p className="text-sm text-gray-500">Configure payment gateways</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            checked={settings.payment.mpesa_enabled}
                                            onChange={(e) => updateSection('payment', 'mpesa_enabled', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span className="flex items-center gap-2 flex-1">
                                            <Smartphone className="w-5 h-5 text-green-600" />
                                            <span className="font-medium">M-Pesa</span>
                                            <span className="text-sm text-gray-500">Pay with M-Pesa via STK Push</span>
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            checked={settings.payment.card_enabled}
                                            onChange={(e) => updateSection('payment', 'card_enabled', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span className="flex items-center gap-2 flex-1">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            <span className="font-medium">Card Payment</span>
                                            <span className="text-sm text-gray-500">Visa, Mastercard</span>
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            checked={settings.payment.cash_enabled}
                                            onChange={(e) => updateSection('payment', 'cash_enabled', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span className="flex items-center gap-2 flex-1">
                                            <Truck className="w-5 h-5 text-purple-600" />
                                            <span className="font-medium">Cash on Delivery</span>
                                            <span className="text-sm text-gray-500">Pay when you receive</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>
                                        <p className="text-sm text-gray-500">Configure email and SMS alerts</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.order_notifications}
                                            onChange={(e) => updateSection('notifications', 'order_notifications', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span>Email notifications for new orders</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.low_stock_notifications}
                                            onChange={(e) => updateSection('notifications', 'low_stock_notifications', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span>Alert when products are low in stock</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.customer_review_notifications}
                                            onChange={(e) => updateSection('notifications', 'customer_review_notifications', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span>Notify when customers leave reviews</span>
                                    </label>

                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notification Email (optional)
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.notifications.notification_email}
                                            onChange={(e) => updateSection('notifications', 'notification_email', e.target.value)}
                                            placeholder="admin@ktech.co.ke"
                                            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
                                        <p className="text-sm text-gray-500">Configure security and authentication</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security.two_factor_auth}
                                            onChange={(e) => updateSection('security', 'two_factor_auth', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span>Enable Two-Factor Authentication for admin accounts</span>
                                    </label>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Session Timeout (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.security.session_timeout}
                                            onChange={(e) => updateSection('security', 'session_timeout', parseInt(e.target.value))}
                                            className="w-32 px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Users will be logged out after this period of inactivity
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'seo' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Search className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">SEO Settings</h2>
                                        <p className="text-sm text-gray-500">Meta tags and keywords</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                        <input
                                            type="text"
                                            value={settings.seo.meta_title}
                                            onChange={(e) => updateSection('seo', 'meta_title', e.target.value)}
                                            placeholder="K-TECH Electronics - Best Electronics in Kenya"
                                            className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                        <textarea
                                            value={settings.seo.meta_description}
                                            onChange={(e) => updateSection('seo', 'meta_description', e.target.value)}
                                            rows="2"
                                            placeholder="Shop the latest smartphones, laptops, and accessories in Kenya"
                                            className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                                        <input
                                            type="text"
                                            value={settings.seo.meta_keywords}
                                            onChange={(e) => updateSection('seo', 'meta_keywords', e.target.value)}
                                            placeholder="electronics, smartphones, laptops, Kenya"
                                            className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'social' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Social Media Links</h2>
                                        <p className="text-sm text-gray-500">Connect your social accounts</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <Facebook className="w-4 h-4 text-blue-600" />
                                            Facebook
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.social.facebook}
                                            onChange={(e) => updateSection('social', 'facebook', e.target.value)}
                                            placeholder="https://facebook.com/ktech"
                                            className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <Twitter className="w-4 h-4 text-blue-400" />
                                            Twitter
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.social.twitter}
                                            onChange={(e) => updateSection('social', 'twitter', e.target.value)}
                                            placeholder="https://twitter.com/ktech"
                                            className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <Instagram className="w-4 h-4 text-pink-600" />
                                            Instagram
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.social.instagram}
                                            onChange={(e) => updateSection('social', 'instagram', e.target.value)}
                                            placeholder="https://instagram.com/ktech"
                                            className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <Youtube className="w-4 h-4 text-red-600" />
                                            YouTube
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.social.youtube}
                                            onChange={(e) => updateSection('social', 'youtube', e.target.value)}
                                            placeholder="https://youtube.com/@ktech"
                                            className="w-full max-w-lg px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;