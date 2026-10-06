/**
 * Maps a user's role to their designated dashboard / home entry point.
 * 
 * @param {string|undefined} role - The user's role ('student', 'instructor', 'admin', 'super_admin')
 * @returns {string} - The route path
 */
export const getRoleHomePath = (role) => {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor';
    case 'student':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};
