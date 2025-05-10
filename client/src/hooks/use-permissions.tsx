import { useContext, createContext, ReactNode, useState, useEffect } from 'react';
// Import from shared schema with proper implementation
// For now we'll define them here to avoid TypeScript errors during development

// These should match the definitions in shared/schema.ts
const UserRoles = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
} as const;

const PermissionTypes = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
} as const;

const ResourceTypes = {
  EMPLOYEES: 'employees',
  COMPANIES: 'companies',
  DTRS: 'dtrs',
  PAYROLLS: 'payrolls',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  DTR_FORMATS: 'dtr_formats',
  USERS: 'users',
} as const;

// Mock default permissions - should match the ones in shared/schema.ts
const DefaultPermissions = {
  [UserRoles.ADMIN]: {
    [ResourceTypes.EMPLOYEES]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT, PermissionTypes.DELETE],
    [ResourceTypes.COMPANIES]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT, PermissionTypes.DELETE],
    [ResourceTypes.DTRS]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT, PermissionTypes.DELETE, PermissionTypes.APPROVE],
    [ResourceTypes.PAYROLLS]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT, PermissionTypes.DELETE, PermissionTypes.APPROVE],
    [ResourceTypes.REPORTS]: [PermissionTypes.VIEW, PermissionTypes.CREATE],
    [ResourceTypes.SETTINGS]: [PermissionTypes.VIEW, PermissionTypes.EDIT],
    [ResourceTypes.DTR_FORMATS]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT, PermissionTypes.DELETE],
    [ResourceTypes.USERS]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT, PermissionTypes.DELETE],
  },
  [UserRoles.MANAGER]: {
    [ResourceTypes.EMPLOYEES]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT],
    [ResourceTypes.COMPANIES]: [PermissionTypes.VIEW],
    [ResourceTypes.DTRS]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.EDIT, PermissionTypes.APPROVE],
    [ResourceTypes.PAYROLLS]: [PermissionTypes.VIEW, PermissionTypes.CREATE, PermissionTypes.APPROVE],
    [ResourceTypes.REPORTS]: [PermissionTypes.VIEW, PermissionTypes.CREATE],
    [ResourceTypes.SETTINGS]: [PermissionTypes.VIEW],
    [ResourceTypes.DTR_FORMATS]: [PermissionTypes.VIEW],
    [ResourceTypes.USERS]: [PermissionTypes.VIEW],
  },
  [UserRoles.EMPLOYEE]: {
    [ResourceTypes.EMPLOYEES]: [PermissionTypes.VIEW],
    [ResourceTypes.COMPANIES]: [PermissionTypes.VIEW],
    [ResourceTypes.DTRS]: [PermissionTypes.VIEW, PermissionTypes.CREATE],
    [ResourceTypes.PAYROLLS]: [PermissionTypes.VIEW],
    [ResourceTypes.REPORTS]: [PermissionTypes.VIEW],
    [ResourceTypes.SETTINGS]: [],
    [ResourceTypes.DTR_FORMATS]: [],
    [ResourceTypes.USERS]: [],
  },
};

// Types
type PermissionKey = keyof typeof PermissionTypes;
type ResourceKey = keyof typeof ResourceTypes;
type Role = typeof UserRoles[keyof typeof UserRoles];

interface PermissionsContextType {
  userRole: Role | null;
  hasPermission: (resource: ResourceKey, permission: PermissionKey) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  canAccess: (path: string) => boolean;
  managedCompanyIds: number[];
}

interface PermissionsProviderProps {
  children: ReactNode;
  initialUserRole?: Role | null;
  initialPermissions?: Record<string, string[]>;
  initialManagedCompanyIds?: number[];
}

// Route access mapping
const routeAccessMap: Record<string, ResourceKey> = {
  '/': 'EMPLOYEES', // Dashboard counts as view access to employees
  '/employees': 'EMPLOYEES',
  '/companies': 'COMPANIES',
  '/dtr-management': 'DTRS',
  '/payroll': 'PAYROLLS',
  '/reports': 'REPORTS',
  '/settings': 'SETTINGS',
};

// Create context
const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({
  children,
  initialUserRole = null,
  initialPermissions = {},
  initialManagedCompanyIds = [],
}: PermissionsProviderProps) {
  const [userRole, setUserRole] = useState<Role | null>(initialUserRole);
  const [customPermissions, setCustomPermissions] = useState<Record<string, string[]>>(initialPermissions);
  const [managedCompanyIds, setManagedCompanyIds] = useState<number[]>(initialManagedCompanyIds);
  
  // Update permissions when user data changes
  useEffect(() => {
    // This would typically be fetched from an API
    // For now, we'll just use the initialPermissions
    setUserRole(initialUserRole);
    setCustomPermissions(initialPermissions);
    setManagedCompanyIds(initialManagedCompanyIds);
  }, [initialUserRole, initialPermissions, initialManagedCompanyIds]);
  
  // Check if user has a specific permission
  const hasPermission = (resource: ResourceKey, permission: PermissionKey): boolean => {
    if (!userRole) return false;
    
    // Check custom permissions first
    if (customPermissions && 
        customPermissions[ResourceTypes[resource]] && 
        customPermissions[ResourceTypes[resource]].includes(PermissionTypes[permission])) {
      return true;
    }
    
    // Fall back to default role permissions
    return DefaultPermissions[userRole][ResourceTypes[resource]]?.includes(PermissionTypes[permission]) || false;
  };
  
  // Role shortcuts
  const isAdmin = userRole === UserRoles.ADMIN;
  const isManager = userRole === UserRoles.MANAGER;
  const isEmployee = userRole === UserRoles.EMPLOYEE;
  
  // Check if user can access a route
  const canAccess = (path: string): boolean => {
    // Root path is always accessible
    if (path === '/') return true;
    
    // Get the resource type for the path
    const resource = routeAccessMap[path];
    if (!resource) return false;
    
    // Check view permission
    return hasPermission(resource, 'VIEW');
  };
  
  return (
    <PermissionsContext.Provider
      value={{
        userRole,
        hasPermission,
        isAdmin,
        isManager,
        isEmployee,
        canAccess,
        managedCompanyIds,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

// Hook for using permissions
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Higher order component for protecting components by permission
export function withPermission(
  Component: React.ComponentType<any>,
  resource: ResourceKey,
  permission: PermissionKey
) {
  return function ProtectedComponent(props: any) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(resource, permission)) {
      return <div className="p-4 text-error">You do not have permission to access this resource.</div>;
    }
    
    return <Component {...props} />;
  };
}