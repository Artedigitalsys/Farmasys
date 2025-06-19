import { useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Lock, Unlock } from 'lucide-react';
import DataTable from '../components/DataTable';
import { mockUsers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type User = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  permissions: string[];
  lastLogin: string;
  status: 'active' | 'inactive';
};

type UserFormData = Omit<User, 'id' | 'lastLogin'> & {
  password?: string;
};

const availablePermissions = [
  { id: 'users.manage', label: 'Gerenciar Usuários' },
  { id: 'medications.manage', label: 'Gerenciar Medicamentos' },
  { id: 'medications.view', label: 'Visualizar Medicamentos' },
  { id: 'batches.manage', label: 'Gerenciar Lotes' },
  { id: 'batches.view', label: 'Visualizar Lotes' },
  { id: 'inventory.manage', label: 'Gerenciar Estoque' },
  { id: 'inventory.view', label: 'Visualizar Estoque' },
  { id: 'reports.view', label: 'Visualizar Relatórios' },
];

const Settings = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    role: 'user',
    email: '',
    permissions: [],
    status: 'active',
  });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  const { user: currentAuthUser, hasPermission } = useAuth();
  const canManageUsers = hasPermission('users.manage');

  // Redirecionar se não tiver permissão
  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>Você não tem permissão para acessar esta página.</span>
        </div>
        <p className="text-gray-600">
          Entre em contato com um administrador se acredita que isso é um erro.
        </p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData((prev) => {
      const updatedPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
      
      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  const handleAddNew = () => {
    setCurrentUser(null);
    setFormData({
      username: '',
      fullName: '',
      role: 'user',
      email: '',
      permissions: [],
      status: 'active',
      password: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      permissions: user.permissions,
      status: user.status,
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    // Prevenir exclusão de si mesmo
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.username === currentAuthUser?.username) {
      toast.error("Você não pode excluir sua própria conta");
      return;
    }
    
    setConfirmDelete(id);
  };

  const toggleUserStatus = (user: User) => {
    // Prevenir desativação de si mesmo
    if (user.username === currentAuthUser?.username) {
      toast.error("Você não pode desativar sua própria conta");
      return;
    }
    
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id 
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } 
          : u
      )
    );
    
    toast.success(`Usuário ${user.status === 'active' ? 'desativado' : 'ativado'} com sucesso`);
  };

  const confirmDeleteUser = () => {
    if (confirmDelete) {
      setUsers((prev) => prev.filter((user) => user.id !== confirmDelete));
      toast.success('Usuário excluído com sucesso');
      setConfirmDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentUser) {
      // Atualizar usuário existente
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, ...formData, lastLogin: u.lastLogin } : u
        )
      );
      toast.success('Usuário atualizado com sucesso');
    } else {
      // Adicionar novo usuário
      if (!formData.password) {
        toast.error('Senha é obrigatória para novos usuários');
        return;
      }
      
      const newId = Math.max(0, ...users.map((u) => u.id)) + 1;
      setUsers((prev) => [...prev, { 
        id: newId, 
        ...formData, 
        lastLogin: 'Nunca' 
      }]);
      toast.success('Usuário adicionado com sucesso');
    }
    
    setShowModal(false);
  };

  const columns = [
    { header: 'Nome de Usuário', accessor: 'username' as keyof User },
    { header: 'Nome Completo', accessor: 'fullName' as keyof User },
    { header: 'Função', accessor: 'role' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Último Login', accessor: 'lastLogin' as keyof User },
    { 
      header: 'Status', 
      accessor: 'status' as keyof User,
      cell: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.status === 'active' ? (
            <>
              <span className="h-2 w-2 rounded-full bg-green-400 mr-1.5"></span>
              Ativo
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-red-400 mr-1.5"></span>
              Inativo
            </>
          )}
        </span>
      )
    },
  ];

  const userActions = (user: User) => (
    <div className="flex space-x-2 justify-end">
      <button
        onClick={() => toggleUserStatus(user)}
        className={`p-1 rounded-md ${
          user.status === 'active' 
            ? 'text-orange-600 hover:bg-orange-50' 
            : 'text-green-600 hover:bg-green-50'
        }`}
        title={user.status === 'active' ? 'Desativar Usuário' : 'Ativar Usuário'}
      >
        {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
      </button>
      <button
        onClick={() => handleEdit(user)}
        className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
        title="Editar Usuário"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => handleDelete(user.id)}
        className={`p-1 rounded-md ${
          user.username === currentAuthUser?.username
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-red-600 hover:bg-red-50'
        }`}
        disabled={user.username === currentAuthUser?.username}
        title={
          user.username === currentAuthUser?.username
            ? "Não é possível excluir sua própria conta"
            : 'Excluir Usuário'
        }
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Adicionar Usuário</span>
        </button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        title="Usuários"
        exportFilename="usuarios"
        actions={userActions}
      />

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Função
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="user">Usuário</option>
                      <option value="pharmacist">Farmacêutico</option>
                      <option value="assistant">Assistente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                
                {!currentUser && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Senha
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      required={!currentUser}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissões
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-gray-200 rounded-md p-3">
                    {availablePermissions.map((permission) => (
                      <label key={permission.id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {currentUser ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3 mx-auto">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
                Confirmar Exclusão
              </h3>
              <p className="text-center text-gray-500 mb-6">
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;