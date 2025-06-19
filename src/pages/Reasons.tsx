import { useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import { mockReasons } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type Reason = {
  id: number;
  code: string;
  description: string;
  active: boolean;
};

const Reasons = () => {
  const [reasons, setReasons] = useState<Reason[]>(mockReasons);
  const [showModal, setShowModal] = useState(false);
  const [currentReason, setCurrentReason] = useState<Reason | null>(null);
  const [formData, setFormData] = useState({ code: '', description: '', active: true });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  const { hasPermission } = useAuth();
  const canManageReasons = hasPermission('inventory.manage');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddNew = () => {
    setCurrentReason(null);
    setFormData({ code: '', description: '', active: true });
    setShowModal(true);
  };

  const handleEdit = (reason: Reason) => {
    setCurrentReason(reason);
    setFormData({
      code: reason.code,
      description: reason.description,
      active: reason.active
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
  };

  const confirmDeleteReason = () => {
    if (confirmDelete) {
      setReasons(prev => prev.filter(reason => reason.id !== confirmDelete));
      toast.success('Motivo excluído com sucesso');
      setConfirmDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentReason) {
      setReasons(prev =>
        prev.map(reason =>
          reason.id === currentReason.id
            ? { ...reason, ...formData }
            : reason
        )
      );
      toast.success('Motivo atualizado com sucesso');
    } else {
      const newId = Math.max(0, ...reasons.map(r => r.id)) + 1;
      setReasons(prev => [...prev, { id: newId, ...formData }]);
      toast.success('Motivo adicionado com sucesso');
    }
    
    setShowModal(false);
  };

  const columns = [
    { header: 'Código', accessor: 'code' as keyof Reason },
    { header: 'Descrição', accessor: 'description' as keyof Reason },
    { 
      header: 'Status', 
      accessor: 'active' as keyof Reason,
      cell: (reason: Reason) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          reason.active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {reason.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
  ];

  const reasonActions = (reason: Reason) => (
    <div className="flex space-x-2 justify-end">
      <button
        onClick={() => handleEdit(reason)}
        className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
        title="Editar Motivo"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => handleDelete(reason.id)}
        className="p-1 rounded-md text-red-600 hover:bg-red-50"
        title="Excluir Motivo"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  if (!canManageReasons) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-100 text-red-800 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Você não tem permissão para acessar esta página.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Motivos de Movimentação</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Adicionar Motivo</span>
        </button>
      </div>

      <DataTable
        data={reasons}
        columns={columns}
        title="Lista de Motivos"
        exportFilename="motivos"
        actions={reasonActions}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentReason ? 'Editar Motivo' : 'Novo Motivo'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Código
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Ativo
                  </label>
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
                  {currentReason ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
                Confirmar Exclusão
              </h3>
              <p className="text-center text-gray-500 mb-6">
                Tem certeza que deseja excluir este motivo? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteReason}
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

export default Reasons;