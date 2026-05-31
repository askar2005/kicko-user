import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import Home from './pages/Home/index';
import AllTurfs from './pages/AllTurfs/index';
import TurfDetail from './pages/TurfDetail/index';
import Checkout from './pages/Checkout/index';
import MyBookings from './pages/MyBookings/index';
import Notifications from './pages/Notifications/index';
import PaymentOptions from './pages/PaymentOptions/index';
import PaymentSuccess from './pages/PaymentSuccess/index';
import BookingDetails from './pages/BookingDetails';

// Actual Auth Pages
import Login from './pages/auth/Login/index';
import Register from './pages/auth/Register/index';
import ForgotPassword from './pages/auth/ForgotPassword/index';
import EmailVerification from './pages/auth/EmailVerification/index';
import OTPVerification from './pages/auth/OTPVerification/index';
import ResetPassword from './pages/auth/ResetPassword/index';

// Mock Pages (to be implemented)
import Settings from './pages/Settings/index';

// Static Pages
import AboutUs, { PrivacyPolicy, TermsConditions } from './pages/StaticPages';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/email-verification" element={<EmailVerification />} />
                <Route path="/otp-verification" element={<OTPVerification />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Main Routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/all-turfs" element={<AllTurfs />} />
                <Route path="/turf/:id" element={<TurfDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/bookings" element={<MyBookings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/payment-options" element={<PaymentOptions />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/booking-details/:bookingId" element={<BookingDetails />} />

                {/* Static Pages */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
