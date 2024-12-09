import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  Package, 
  FileText,
  UserPlus,
  Settings,
  Save,
  Bell,
  BarChart
} from 'lucide-react';

export const menuItems = [
  { 
    icon: Calendar, 
    label: 'Agenda',
    path: '/agenda2', 
    permissions: ['view_appointments']
  },
  {
    icon: LayoutDashboard,
    label: 'Tableau de bord',
    path: '/',
    permissions: ['view_dashboard']
  },
  { 
    icon: CreditCard, 
    label: 'Paiement', 
    path: '/billing', 
    permissions: ['view_billing']
  },
  { 
    icon: Users, 
    label: 'Patients', 
    path: '/patients', 
    permissions: ['view_patients']
  },
  { 
    icon: Bell,
    label: 'Notifications',
    path: '/notifications',
    permissions: ['manage_users']
  },
  { 
    icon: Package,
    label: 'Gestion Cabinet',
    isSubmenu: true,
    permissions: ['view_supplies'],
    submenu: [
      {
        icon: FileText,
        label: 'Documents médicaux',
        path: '/treatments',
        permissions: ['view_treatments']
      },
      {
        icon: Package,
        label: 'Fournitures',
        path: '/cabinet',
        permissions: ['view_supplies']
      },
      {
        icon: BarChart,
        label: 'Statistiques',
        path: '/statistics',
        permissions: ['view_supplies']
      },
      {
        icon: Users,
        label: 'Absences',
        path: '/absences',
        permissions: ['view_supplies']
      },
      {
        icon: UserPlus,
        label: 'Utilisateurs',
        path: '/admin',
        permissions: ['manage_users']
      },
      {
        icon: Save,
        label: 'Sauvegarde',
        path: '/backup',
        permissions: ['manage_users']
      }
    ]
  }
];