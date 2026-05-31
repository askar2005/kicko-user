import fs from 'fs';
import path from 'path';

const dirs = [
    'src/pages/auth/Login',
    'src/pages/auth/Register',
    'src/pages/auth/ForgotPassword',
    'src/pages/auth/EmailVerification',
    'src/pages/auth/OTPVerification',
    'src/pages/auth/ResetPassword',
    'src/pages/Home',
    'src/pages/TurfDetail',
    'src/pages/Checkout',
    'src/pages/MyBookings',
    'src/pages/ProfileSettings',
    'src/pages/Notifications'
];

dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created: ${dir}`);
    }
});
