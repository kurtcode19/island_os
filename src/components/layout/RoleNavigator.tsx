import { UserRole } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function RoleNavigator({ role, onRoleChange, isMobile }: { role: UserRole, onRoleChange: (role: UserRole) => void, isMobile: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // If on mobile and not already on the mobile view or planner, redirect to /mobile
    if (isMobile && currentPath !== '/mobile' && currentPath !== '/planner') {
      navigate('/mobile');
      return;
    }

    // If not on mobile but on the mobile view, redirect back to home (or stay if appropriate)
    if (!isMobile && currentPath === '/mobile') {
      navigate('/');
      return;
    }

    // Auto-switch role based on path
    // This is now the primary way role state is updated
    if (currentPath.startsWith('/business')) {
      if (role !== 'BUSINESS') onRoleChange('BUSINESS');
    } else if (currentPath.startsWith('/government')) {
      if (role !== 'LGU') onRoleChange('LGU');
    } else {
      // If not in a dashboard path, default to TOURIST
      if (role !== 'TOURIST') onRoleChange('TOURIST');
    }
  }, [location.pathname, isMobile, onRoleChange, role, navigate]);

  return null;
}
