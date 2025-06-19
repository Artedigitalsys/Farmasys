// Mock data for the pharmacy management system

export const mockSuppliers = [
  { id: 1, name: 'Pharma Inc', active: true },
  { id: 2, name: 'MediCorp', active: true },
  { id: 3, name: 'AllergyCare', active: true },
  { id: 4, name: 'DiabeCare', active: true },
  { id: 5, name: 'CardioMed', active: true },
  { id: 6, name: 'RespiCare', active: true },
];

export const mockReasons = [
  { id: 1, code: 'ADJ', description: 'Ajuste de Estoque', active: true },
  { id: 2, code: 'DEV', description: 'Devolução', active: true },
  { id: 3, code: 'PER', description: 'Perda', active: true },
  { id: 4, code: 'VEN', description: 'Vencimento', active: true },
  { id: 5, code: 'DOA', description: 'Doação', active: true },
];

export const mockMedications = [
  { id: 1, code: 'MED001', name: 'Paracetamol 500mg', category: 'Analgesic', supplier: 'Pharma Inc', reorderLevel: 100 },
  { id: 2, code: 'MED002', name: 'Amoxicillin 250mg', category: 'Antibiotic', supplier: 'MediCorp', reorderLevel: 50 },
  { id: 3, code: 'MED003', name: 'Omeprazole 20mg', category: 'Antacid', supplier: 'Pharma Inc', reorderLevel: 40 },
  { id: 4, code: 'MED004', name: 'Loratadine 10mg', category: 'Antihistamine', supplier: 'AllergyCare', reorderLevel: 30 },
  { id: 5, code: 'MED005', name: 'Simvastatin 20mg', category: 'Cholesterol', supplier: 'MediCorp', reorderLevel: 25 },
  { id: 6, code: 'MED006', name: 'Metformin 500mg', category: 'Diabetes', supplier: 'DiabeCare', reorderLevel: 60 },
  { id: 7, code: 'MED007', name: 'Atorvastatin 10mg', category: 'Cholesterol', supplier: 'MediCorp', reorderLevel: 35 },
  { id: 8, code: 'MED008', name: 'Ibuprofen 400mg', category: 'Analgesic', supplier: 'Pharma Inc', reorderLevel: 80 },
  { id: 9, code: 'MED009', name: 'Salbutamol Inhaler', category: 'Respiratory', supplier: 'RespiCare', reorderLevel: 20 },
  { id: 10, code: 'MED010', name: 'Amlodipine 5mg', category: 'Cardiovascular', supplier: 'CardioMed', reorderLevel: 45 },
  { id: 11, code: 'MED011', name: 'Diazepam 5mg', category: 'Anxiolytic', supplier: 'MediCorp', reorderLevel: 15 },
  { id: 12, code: 'MED012', name: 'Ciprofloxacin 500mg', category: 'Antibiotic', supplier: 'Pharma Inc', reorderLevel: 40 },
];

export const mockBatches = [
  { 
    id: 1, 
    medicationId: 1, 
    medicationName: 'Paracetamol 500mg',
    batchNumber: 'B001', 
    quantity: 1000, 
    receivedDate: '2023-10-15', 
    expiryDate: '2025-10-15', 
    supplier: 'Pharma Inc', 
    receivedBy: 'admin',
    currentStock: 780
  },
  { 
    id: 2, 
    medicationId: 2, 
    medicationName: 'Amoxicillin 250mg',
    batchNumber: 'B002', 
    quantity: 500, 
    receivedDate: '2023-11-02', 
    expiryDate: '2024-11-02', 
    supplier: 'MediCorp', 
    receivedBy: 'admin',
    currentStock: 320
  },
  { 
    id: 3, 
    medicationId: 3, 
    medicationName: 'Omeprazole 20mg',
    batchNumber: 'B003', 
    quantity: 400, 
    receivedDate: '2023-12-10', 
    expiryDate: '2025-06-10', 
    supplier: 'Pharma Inc', 
    receivedBy: 'user',
    currentStock: 350
  },
  { 
    id: 4, 
    medicationId: 1, 
    medicationName: 'Paracetamol 500mg',
    batchNumber: 'B004', 
    quantity: 800, 
    receivedDate: '2024-01-05', 
    expiryDate: '2026-01-05', 
    supplier: 'Pharma Inc', 
    receivedBy: 'admin',
    currentStock: 800
  },
  { 
    id: 5, 
    medicationId: 4, 
    medicationName: 'Loratadine 10mg',
    batchNumber: 'B005', 
    quantity: 300, 
    receivedDate: '2024-01-20', 
    expiryDate: '2025-01-20', 
    supplier: 'AllergyCare', 
    receivedBy: 'user',
    currentStock: 210
  },
  { 
    id: 6, 
    medicationId: 8, 
    medicationName: 'Ibuprofen 400mg',
    batchNumber: 'B006', 
    quantity: 600, 
    receivedDate: '2024-02-15', 
    expiryDate: '2026-02-15', 
    supplier: 'Pharma Inc', 
    receivedBy: 'admin',
    currentStock: 580
  },
  { 
    id: 7, 
    medicationId: 10, 
    medicationName: 'Amlodipine 5mg',
    batchNumber: 'B007', 
    quantity: 450, 
    receivedDate: '2024-03-01', 
    expiryDate: '2024-09-01', 
    supplier: 'CardioMed', 
    receivedBy: 'admin',
    currentStock: 420
  },
  { 
    id: 8, 
    medicationId: 6, 
    medicationName: 'Metformin 500mg',
    batchNumber: 'B008', 
    quantity: 500, 
    receivedDate: '2024-03-10', 
    expiryDate: '2025-03-10', 
    supplier: 'DiabeCare', 
    receivedBy: 'user',
    currentStock: 490
  },
];

export const mockInventoryMovements = [
  { 
    id: 1, 
    type: 'in', 
    medicationId: 1, 
    medicationName: 'Paracetamol 500mg',
    batchId: 1, 
    batchNumber: 'B001',
    quantity: 1000, 
    date: '2023-10-15', 
    user: 'admin', 
    reason: 'Entrada Inicial',
    reasonId: 1
  },
  { 
    id: 2, 
    type: 'out', 
    medicationId: 1, 
    medicationName: 'Paracetamol 500mg',
    batchId: 1, 
    batchNumber: 'B001',
    quantity: 50, 
    date: '2023-10-20', 
    user: 'user', 
    reason: 'Dispensação Regular',
    reasonId: 2
  },
  { 
    id: 3, 
    type: 'in', 
    medicationId: 2, 
    medicationName: 'Amoxicillin 250mg',
    batchId: 2, 
    batchNumber: 'B002',
    quantity: 500, 
    date: '2023-11-02', 
    user: 'admin', 
    reason: 'Novo Lote',
    reasonId: 1
  },
  { 
    id: 4, 
    type: 'out', 
    medicationId: 1, 
    medicationName: 'Paracetamol 500mg',
    batchId: 1, 
    batchNumber: 'B001',
    quantity: 100, 
    date: '2023-11-15', 
    user: 'admin', 
    reason: 'Alta Demanda',
    reasonId: 2
  },
  { 
    id: 5, 
    type: 'in', 
    medicationId: 3, 
    medicationName: 'Omeprazole 20mg',
    batchId: 3, 
    batchNumber: 'B003',
    quantity: 400, 
    date: '2023-12-10', 
    user: 'user', 
    reason: 'Reposição',
    reasonId: 1
  },
  { 
    id: 6, 
    type: 'out', 
    medicationId: 2, 
    medicationName: 'Amoxicillin 250mg',
    batchId: 2, 
    batchNumber: 'B002',
    quantity: 75, 
    date: '2023-12-20', 
    user: 'user', 
    reason: 'Dispensação Regular',
    reasonId: 2
  },
  { 
    id: 7, 
    type: 'in', 
    medicationId: 1, 
    medicationName: 'Paracetamol 500mg',
    batchId: 4, 
    batchNumber: 'B004',
    quantity: 800, 
    date: '2024-01-05', 
    user: 'admin', 
    reason: 'Novo Lote',
    reasonId: 1
  },
  { 
    id: 8, 
    type: 'out', 
    medicationId: 3, 
    medicationName: 'Omeprazole 20mg',
    batchId: 3, 
    batchNumber: 'B003',
    quantity: 50, 
    date: '2024-01-10', 
    user: 'admin', 
    reason: 'Dispensação Regular',
    reasonId: 2
  },
  { 
    id: 9, 
    type: 'out', 
    medicationId: 1, 
    medicationName: 'Paracetamol 500mg',
    batchId: 1, 
    batchNumber: 'B001',
    quantity: 70, 
    date: '2024-01-15', 
    user: 'user', 
    reason: 'Aumento de Demanda',
    reasonId: 2
  },
  { 
    id: 10, 
    type: 'in', 
    medicationId: 4, 
    medicationName: 'Loratadine 10mg',
    batchId: 5, 
    batchNumber: 'B005',
    quantity: 300, 
    date: '2024-01-20', 
    user: 'user', 
    reason: 'Estoque Sazonal',
    reasonId: 1
  },
];

export const mockUsers = [
  {
    id: 1,
    username: 'renatocsrib',
    fullName: 'Renato Silva',
    role: 'admin',
    email: 'renato@example.com',
    permissions: ['users.manage', 'medications.manage', 'batches.manage', 'inventory.manage', 'reports.view'],
    lastLogin: '2024-06-01 08:30:22',
    status: 'active'
  },
  {
    id: 2,
    username: 'user',
    fullName: 'Test User',
    role: 'user',
    email: 'user@example.com',
    permissions: ['medications.view', 'batches.view', 'inventory.manage'],
    lastLogin: '2024-06-01 09:15:45',
    status: 'active'
  },
  {
    id: 3,
    username: 'maria',
    fullName: 'Maria Oliveira',
    role: 'pharmacist',
    email: 'maria@example.com',
    permissions: ['medications.manage', 'batches.manage', 'inventory.manage', 'reports.view'],
    lastLogin: '2024-05-31 14:22:10',
    status: 'active'
  },
  {
    id: 4,
    username: 'carlos',
    fullName: 'Carlos Santos',
    role: 'assistant',
    email: 'carlos@example.com',
    permissions: ['medications.view', 'batches.view', 'inventory.view'],
    lastLogin: '2024-05-30 11:05:33',
    status: 'inactive'
  },
  {
    id: 5,
    username: 'artedigitalsys',
    fullName: 'Arte Digital Systems',
    role: 'admin',
    email: 'artedigitalsys@gmail.com',
    permissions: ['users.manage', 'medications.manage', 'batches.manage', 'inventory.manage', 'reports.view'],
    lastLogin: '2024-06-06 10:00:00',
    status: 'active'
  }
];

export const mockDashboardData = {
  stats: {
    totalMedications: 12,
    activeBatches: 8,
    lowStockItems: 3,
    expiringSoon: 2
  },
  inventoryMovements: [
    { date: '06/01', in: 120, out: 45 },
    { date: '06/02', in: 0, out: 65 },
    { date: '06/03', in: 200, out: 80 },
    { date: '06/04', in: 0, out: 90 },
    { date: '06/05', in: 150, out: 60 },
    { date: '06/06', in: 0, out: 75 },
    { date: '06/07', in: 180, out: 100 },
  ],
  topMedications: [
    { name: 'Paracetamol', quantity: 220 },
    { name: 'Amoxicillin', quantity: 180 },
    { name: 'Ibuprofen', quantity: 140 },
    { name: 'Omeprazole', quantity: 90 },
    { name: 'Loratadine', quantity: 70 },
  ],
  stockDistribution: [
    { name: 'Analgesics', value: 35 },
    { name: 'Antibiotics', value: 25 },
    { name: 'Antacids', value: 15 },
    { name: 'Antihistamines', value: 10 },
    { name: 'Others', value: 15 },
  ],
  recentActivity: [
    { 
      type: 'out', 
      description: 'Dispensed 20 units of Paracetamol 500mg (Batch B001)', 
      user: 'Maria Oliveira', 
      time: '1 hour ago' 
    },
    { 
      type: 'in', 
      description: 'Received 500 units of Salbutamol Inhaler (Batch B009)', 
      user: 'Renato Silva', 
      time: '3 hours ago' 
    },
    { 
      type: 'out', 
      description: 'Dispensed 15 units of Amoxicillin 250mg (Batch B002)', 
      user: 'Test User', 
      time: '5 hours ago' 
    },
    { 
      type: 'adjustment', 
      description: 'Adjusted stock: -5 units of Metformin 500mg (Batch B008)', 
      user: 'Renato Silva', 
      time: '6 hours ago' 
    },
    { 
      type: 'out', 
      description: 'Dispensed 10 units of Omeprazole 20mg (Batch B003)', 
      user: 'Maria Oliveira', 
      time: 'Yesterday at 15:30' 
    },
  ]
};