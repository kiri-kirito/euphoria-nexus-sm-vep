/** Map DB role values to dashboard routes (agent role uses /delivery/*). */
export function getDashboardPath(role: string | null | undefined): string | null {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'agent':
    case 'delivery':
      return '/delivery/dashboard';
    case 'support':
      return '/support/dashboard';
    default:
      return null;
  }
}

export function getRoleLabel(role: string): string {
  if (role === 'agent' || role === 'delivery') return 'Delivery';
  return role.charAt(0).toUpperCase() + role.slice(1);
}
