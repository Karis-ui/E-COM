import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Settings,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    X,
    ChevronLeft,
    Truck,
    CreditCard,
    Bell,
    Lock,
    Globe,
    Home,
    DollarSign,
    Users,
    Package,
    ShoppingBag,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        general: {
            shop_name: 'K-TECH Electronics',
            shop_email: 'info@ktech.co.ke',
            shop_phone: '+254 700 123 456',
            shop_address: 'Nairobi, Kenya',
            shop_currency: 'KES',
            timezone: 'Africa/Nairobi'
        },
        payment: {
            mpesa_enabled: true,
            card_enabled: true,
            cash_enabled: true,
            mpesa_shortcode: '174379',
            payment_gateway: 'pesapal'
        },
        delivery: {
            nairobi_fee: 300,
            other_counties_fee: 500,
            free_delivery_threshold: 10000,
            delivery_time: '2-3 business days'
        },
        notifications: {
            order_notifications: true,
            low_stock_notifications: true,
            customer_review_notifications: true,
            notification_email: 'admin@ktech.co.ke'
        },
        security: {
            two_factor_auth: false,
            session_timeout: 60,
            require_strong_password: true
        },
        seo: {
            meta_title: 'K-TECH Electronics - Best Electronics Store in Kenya',
            meta_description: 'Shop the latest smartphones, laptops, and accessories in Kenya',
            meta_keywords: 'electronics, smartphones, laptops, Kenya, online shopping'
        }
    });

    const tab = location.pathname.split('/').pop();
    const activeTab = (tab === 'settings' || tab === 'admin') ? 'general' : tab;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getSettings();
            if (res.data) {
                setSettings(res.data);
            }
        } catch (err) {
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await adminAPI.updateSettings(settings);
            toast.success('Settings saved successfully');
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const settingsTabs = [
        { id: 'general', label: 'General', icon: Home },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'seo', label: 'SEO', icon: Globe },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input
                        type="text"
                        value={settings.general.shop_name}
                        onChange={(e) => handleChange('general', 'shop_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Email</label>
                    <input
                        type="email"
                        value={settings.general.shop_email}
                        onChange={(e) => handleChange('general', 'shop_email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Phone</label>
                    <input
                        type="text"
                        value={settings.general.shop_phone}
                        onChange={(e) => handleChange('general', 'shop_phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                    <input
                        type="text"
                        value={settings.general.shop_address}
                        onChange={(e) => handleChange('general', 'shop_address', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <input
                        type="text"
                        value={settings.general.shop_currency}
                        onChange={(e) => handleChange('general', 'shop_currency', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                        value={settings.general.timezone}
                        onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderPaymentSettings = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.payment.mpesa_enabled}
                        onChange={(e) => handleChange('payment', 'mpesa_enabled', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="flex items-center gap-2 flex-1">
                        <span className="font-medium">M-Pesa</span>
                        <span className="text-sm text-gray-500">Pay with M-Pesa via STK Push</span>
                    </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.payment.card_enabled}
                        onChange={(e) => handleChange('payment', 'card_enabled', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="flex items-center gap-2 flex-1">
                        <span className="font-medium">Card Payment</span>
                        <span className="text-sm text-gray-500">Visa, Mastercard, American Express</span>
                    </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.payment.cash_enabled}
                        onChange={(e) => handleChange('payment', 'cash_enabled', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="flex items-center gap-2 flex-1">
                        <span className="font-medium">Cash on Delivery</span>
                        <span className="text-sm text-gray-500">Pay when you receive the order</span>
                    </span>
                </label>
            </div>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Shortcode</label>
                    <input
                        type="text"
                        value={settings.payment.mpesa_shortcode}
                        onChange={(e) => handleChange('payment', 'mpesa_shortcode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Gateway</label>
                    <select
                        value={settings.payment.payment_gateway}
                        onChange={(e) => handleChange('payment', 'payment_gateway', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="pesapal">PesaPal</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderDeliverySettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee - Nairobi (KSh)</label>
                    <input
                        type="number"
                        value={settings.delivery.nairobi_fee}
                        onChange={(e) => handleChange('delivery', 'nairobi_fee', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee - Other Counties (KSh)</label>
                    <input
                        type="number"
                        value={settings.delivery.other_counties_fee}
                        onChange={(e) => handleChange('delivery', 'other_counties_fee', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (KSh)</label>
                    <input
                        type="number"
                        value={settings.delivery.free_delivery_threshold}
                        onChange={(e) => handleChange('delivery', 'free_delivery_threshold', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Orders above this amount get free delivery</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Time</label>
                    <input
                        type="text"
                        value={settings.delivery.delivery_time}
                        onChange={(e) => handleChange('delivery', 'delivery_time', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderNotificationsSettings = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.notifications.order_notifications}
                        onChange={(e) => handleChange('notifications', 'order_notifications', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span>Email notifications for new orders</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.notifications.low_stock_notifications}
                        onChange={(e) => handleChange('notifications', 'low_stock_notifications', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span>Alert when products are low in stock</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.notifications.customer_review_notifications}
                        onChange={(e) => handleChange('notifications', 'customer_review_notifications', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span>Notify when customers leave reviews</span>
                </label>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Email</label>
                <input
                    type="email"
                    value={settings.notifications.notification_email}
                    onChange={(e) => handleChange('notifications', 'notification_email', e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use shop email</p>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.security.two_factor_auth}
                        onChange={(e) => handleChange('security', 'two_factor_auth', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span>Enable Two-Factor Authentication for admin accounts</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                    <input
                        type="checkbox"
                        checked={settings.security.require_strong_password}
                        onChange={(e) => handleChange('security', 'require_strong_password', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span>Require strong passwords</span>
                </label>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                <input
                    type="number"
                    value={settings.security.session_timeout}
                    onChange={(e) => handleChange('security', 'session_timeout', parseInt(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Users will be logged out after this period of inactivity</p>
            </div>
        </div>
    );

    const renderSEOSettings = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                    type="text"
                    value={settings.seo.meta_title}
                    onChange={(e) => handleChange('seo', 'meta_title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                    value={settings.seo.meta_description}
                    onChange={(e) => handleChange('seo', 'meta_description', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                <input
                    type="text"
                    value={settings.seo.meta_keywords}
                    onChange={(e) => handleChange('seo', 'meta_keywords', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
            </div>
        </div>
    );

    const renderSettingsContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings();
            case 'payment':
                return renderPaymentSettings();
            case 'delivery':
                return renderDeliverySettings();
            case 'notifications':
                return renderNotificationsSettings();
            case 'security':
                return renderSecuritySettings();
            case 'seo':
                return renderSEOSettings();
            default:
                return renderGeneralSettings();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-500 mt-1">Configure your store settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="flex flex-wrap gap-1 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <Link
                            key={tab.id}
                            to={`/admin/settings/${tab.id}`}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${isActive
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {renderSettingsContent()}
            </div>
        </div>
    );
};

export default AdminSettingsPage;