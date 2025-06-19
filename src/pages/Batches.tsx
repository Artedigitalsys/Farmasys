import { useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle, ExternalLink } from 'lucide-react';
import DataTable from '../components/DataTable';
import { mockBatches, mockMedications } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type Batch = {
  id: number;
  medicationId: number;
  medicationName: string;
  batchNumber: string;
  quantity: number;
  receivedDate: string;
  expiryDate: string;
  supplier: string;
  receivedBy: string;
  currentStock: number;
};

type BatchFormData = Omit<Batch, 'id' | 'medicationName' | 'batchNumber'> & {
  notes?: string;
};

const Batches = () => {
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [showModal, setShowModal] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<BatchFormData>({
    medicationId: 0,
    quantity: 0,
    receivedDate: '',
    expiryDate: '',
    supplier: '',
    receivedBy: '',
    currentStock: 0,
    notes: ''
  });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  const { user, hasPermission } = useAuth();
  const canManageBatches = hasPermission('batches.manage');

  // Função para gerar código automático do lote
  const generateBatchCode = (medicationId: number): string => {
    const medication = mockMedications.find(m => m.id === medicationId);
    if (!medication) return '';
    
    // Pegar as primeiras 3 letras do nome do medicamento
    const medicationPrefix = medication.name.substring(0, 3).toUpperCase();
    
    // Contar quantos lotes já existem para este medicamento
    const existingBatches = batches.filter(b => b.medicationId === medicationId);
    const nextNumber = existingBatches.length + 1;
    
    // Gerar código no formato: MED001-YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${medicationPrefix}${String(nextNumber).padStart(3, '0')}-${year}-${month}-${day}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['quantity', 'medicationId', 'currentStock'].includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleAddNew = () => {
    setCurrentBatch(null);
    setFormData({
      medicationId: 0,
      quantity: 0,
      receivedDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      supplier: '',
      receivedBy: user?.username || '',
      currentStock: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const handleEdit = (batch: Batch) => {
    setCurrentBatch(batch);
    setFormData({
      medicationId: batch.medicationId,
      quantity: batch.quantity,
      receivedDate: batch.receivedDate,
      expiryDate: batch.expiryDate,
      supplier: batch.supplier,
      receivedBy: batch.receivedBy,
      currentStock: batch.currentStock
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
  };

  const confirmDeleteBatch = () => {
    if (confirmDelete) {
      setBatches((prev) => prev.filter((batch) => batch.id !== confirmDelete));
      toast.success('Lote excluído com sucesso');
      setConfirmDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Encontrar medicamento
    const medication = mockMedications.find(m => m.id === formData.medicationId);
    
    if (!medication) {
      toast.error('Por favor, selecione um medicamento válido');
      return;
    }
    
    if (currentBatch) {
      // Atualizar lote existente
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === currentBatch.id 
            ? { 
                ...batch, 
                ...formData, 
                medicationName: medication.name 
              } 
            : batch
        )
      );
      toast.success('Lote atualizado com sucesso');
    } else {
      // Adicionar novo lote
      const newId = Math.max(0, ...batches.map((b) => b.id)) + 1;
      
      // Gerar código automático do lote
      const batchNumber = generateBatchCode(formData.medicationId);
      
      // Para novos lotes, currentStock deve ser igual à quantidade inicialmente
      const newBatch = { 
        id: newId, 
        ...formData, 
        batchNumber,
        medicationName: medication.name,
        currentStock: formData.quantity 
      };
      
      setBatches((prev) => [...prev, newBatch]);
      toast.success('Lote adicionado com sucesso');
    }
    
    setShowModal(false);
  };

  const columns = [
    { header: 'Código do Lote', accessor: 'batchNumber' as keyof Batch },
    { header: 'Medicamento', accessor: 'medicationName' as keyof Batch },
    { 
      header: 'Quantidade', 
      accessor: 'quantity' as keyof Batch,
      cell: (batch: Batch) => batch.quantity
    },
    { 
      header: 'Estoque Atual', 
      accessor: 'currentStock' as keyof Batch,
      cell: (batch: Batch) => (
        <span className={`font-medium ${
          batch.currentStock < batch.quantity * 0.2 
            ? 'text-red-600' 
            : batch.currentStock < batch.quantity * 0.5 
              ? 'text-orange-600' 
              : 'text-green-600'
        }`}>
          {batch.currentStock}
        </span>
      )
    },
    { header: 'Data de Recebimento', accessor: 'receivedDate' as keyof Batch },
    { 
      header: 'Data de Validade', 
      accessor: 'expiryDate' as keyof Batch,
      cell: (batch: Batch) => {
        const now = new Date();
        const expiry = new Date(batch.expiryDate);
        const diffMonths = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        return (
          <span className={`font-medium ${
            diffMonths <= 1 
              ? 'text-red-600' 
              : diffMonths <= 3 
                ? 'text-orange-600' 
                : 'text-gray-600'
          }`}>
            {batch.expiryDate}
          </span>
        );
      }
    },
    { header: 'Fornecedor', accessor: 'supplier' as keyof Batch },
  ];

  const batchActions = (batch: Batch) => (
    <div className="flex space-x-2 justify-end">
      <button
        onClick={() => handleEdit(batch)}
        disabled={!canManageBatches}
        className={`p-1 rounded-md ${
          canManageBatches
            ? 'text-blue-600 hover:bg-blue-50'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={canManageBatches ? 'Editar' : 'Sem permissão para editar'}
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => handleDelete(batch.id)}
        disabled={!canManageBatches}
        className={`p-1 rounded-md ${
          canManageBatches
            ? 'text-red-600 hover:bg-red-50'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={canManageBatches ? 'Excluir' : 'Sem permissão para excluir'}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lotes</h1>
        {canManageBatches && (
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>Adicionar Lote</span>
          </button>
        )}
      </div>

      <DataTable
        data={batches}
        columns={columns}
        title="Lista de Lotes"
        exportFilename="lotes"
        actions={batchActions}
      />

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentBatch ? 'Editar Lote' : 'Adicionar Novo Lote'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label htmlFor="medicationId" className="block text-sm font-medium text-gray-700">
                    Medicamento
                  </label>
                  <select
                    id="medicationId"
                    name="medicationId"
                    value={formData.medicationId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Selecionar Medicamento</option>
                    {mockMedications.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                {!currentBatch && formData.medicationId > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Código do lote será gerado automaticamente:</strong><br />
                      {generateBatchCode(formData.medicationId)}
                    </p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                {currentBatch && (
                  <div>
                    <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      id="currentStock"
                      name="currentStock"
                      value={formData.currentStock}
                      onChange={handleInputChange}
                      min="0"
                      max={formData.quantity}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="receivedDate" className="block text-sm font-medium text-gray-700">
                    Data de Recebimento
                  </label>
                  <input
                    type="date"
                    id="receivedDate"
                    name="receivedDate"
                    value={formData.receivedDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
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
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
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
                  {currentBatch ? 'Atualizar' : 'Adicionar'}
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
                Tem certeza que deseja excluir este lote? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteBatch}
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

export default Batches;