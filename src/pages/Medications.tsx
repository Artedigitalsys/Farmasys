import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import { mockMedications } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type Medication = {
  id: number;
  code: string;
  name: string;
  category: string;
  supplier: string;
  reorderLevel: number;
};

type MedicationFormData = Omit<Medication, 'id'>;

const Medications = () => {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [showModal, setShowModal] = useState(false);
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<MedicationFormData>({
    code: '',
    name: '',
    category: '',
    supplier: '',
    reorderLevel: 0
  });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  const { hasPermission } = useAuth();
  const canManageMedications = hasPermission('medications.manage');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'reorderLevel' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddNew = () => {
    setCurrentMedication(null);
    setFormData({
      code: '',
      name: '',
      category: '',
      supplier: '',
      reorderLevel: 0
    });
    setShowModal(true);
  };

  const handleEdit = (medication: Medication) => {
    setCurrentMedication(medication);
    setFormData({
      code: medication.code,
      name: medication.name,
      category: medication.category,
      supplier: medication.supplier,
      reorderLevel: medication.reorderLevel
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
  };

  const confirmDeleteMedication = () => {
    if (confirmDelete) {
      setMedications((prev) => prev.filter((med) => med.id !== confirmDelete));
      toast.success('Medicamento excluído com sucesso');
      setConfirmDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentMedication) {
      // Atualizar medicamento existente
      setMedications((prev) =>
        prev.map((med) =>
          med.id === currentMedication.id ? { ...med, ...formData } : med
        )
      );
      toast.success('Medicamento atualizado com sucesso');
    } else {
      // Adicionar novo medicamento
      const newId = Math.max(0, ...medications.map((m) => m.id)) + 1;
      setMedications((prev) => [...prev, { id: newId, ...formData }]);
      toast.success('Medicamento adicionado com sucesso');
    }
    
    setShowModal(false);
  };

  const columns = [
    { header: 'Código', accessor: 'code' as keyof Medication },
    { header: 'Nome', accessor: 'name' as keyof Medication },
    { header: 'Categoria', accessor: 'category' as keyof Medication },
    { header: 'Fornecedor', accessor: 'supplier' as keyof Medication },
    { 
      header: 'Nível de Reposição', 
      accessor: 'reorderLevel' as keyof Medication,
      cell: (medication: Medication) => medication.reorderLevel
    },
  ];

  const medicationActions = (medication: Medication) => (
    <div className="flex space-x-2 justify-end">
      <button
        onClick={() => handleEdit(medication)}
        disabled={!canManageMedications}
        className={`p-1 rounded-md ${
          canManageMedications
            ? 'text-blue-600 hover:bg-blue-50'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={canManageMedications ? 'Editar' : 'Sem permissão para editar'}
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => handleDelete(medication.id)}
        disabled={!canManageMedications}
        className={`p-1 rounded-md ${
          canManageMedications
            ? 'text-red-600 hover:bg-red-50'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={canManageMedications ? 'Excluir' : 'Sem permissão para excluir'}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Medicamentos</h1>
        {canManageMedications && (
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>Adicionar Medicamento</span>
          </button>
        )}
      </div>

      <DataTable
        data={medications}
        columns={columns}
        title="Lista de Medicamentos"
        exportFilename="medicamentos"
        actions={medicationActions}
      />

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentMedication ? 'Editar Medicamento' : 'Adicionar Novo Medicamento'}
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">
                    Nível de Reposição
                  </label>
                  <input
                    type="number"
                    id="reorderLevel"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
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
                  {currentMedication ? 'Atualizar' : 'Adicionar'}
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
                Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteMedication}
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

export default Medications;