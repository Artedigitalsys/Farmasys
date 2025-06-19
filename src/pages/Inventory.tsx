import { useState } from 'react';
import { Plus, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import DataTable from '../components/DataTable';
import { mockInventoryMovements, mockBatches, mockMedications } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type InventoryMovement = {
  id: number;
  type: 'in' | 'out';
  medicationId: number;
  medicationName: string;
  batchId: number;
  batchNumber: string;
  quantity: number;
  date: string;
  user: string;
  notes: string;
};

type MovementFormData = Omit<InventoryMovement, 'id' | 'medicationName' | 'batchNumber' | 'user'> & {
  user: string;
};

const Inventory = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>(mockInventoryMovements);
  const [showModal, setShowModal] = useState(false);
  const [batches, setBatches] = useState(mockBatches);
  const [formData, setFormData] = useState<MovementFormData>({
    type: 'out',
    medicationId: 0,
    batchId: 0,
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    user: '',
    notes: ''
  });
  const [filteredBatches, setFilteredBatches] = useState<typeof mockBatches>([]);
  const [selectedMedicationName, setSelectedMedicationName] = useState('');
  
  const { user, hasPermission } = useAuth();
  const canManageInventory = hasPermission('inventory.manage');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'medicationId') {
      const medicationId = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: medicationId,
        batchId: 0 // Reset batch when medication changes
      }));
      
      // Update filtered batches
      if (medicationId) {
        const filtered = batches.filter(b => b.medicationId === medicationId);
        setFilteredBatches(filtered);
        
        // Set the medication name for display
        const medication = mockMedications.find(m => m.id === medicationId);
        setSelectedMedicationName(medication ? medication.name : '');
      } else {
        setFilteredBatches([]);
        setSelectedMedicationName('');
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ['quantity', 'batchId'].includes(name) ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleAddMovement = () => {
    setFormData({
      type: 'out',
      medicationId: 0,
      batchId: 0,
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      user: user?.username || '',
      notes: ''
    });
    setFilteredBatches([]);
    setSelectedMedicationName('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedBatch = batches.find(b => b.id === formData.batchId);
    
    if (!selectedBatch) {
      toast.error('Por favor, selecione um lote válido');
      return;
    }
    
    // Validation for stock out
    if (formData.type === 'out' && formData.quantity > selectedBatch.currentStock) {
      toast.error(`Não é possível dispensar mais que o estoque atual (${selectedBatch.currentStock})`);
      return;
    }
    
    // Add the movement
    const newId = Math.max(0, ...movements.map(m => m.id)) + 1;
    const newMovement: InventoryMovement = {
      id: newId,
      ...formData,
      medicationName: selectedMedicationName,
      batchNumber: selectedBatch.batchNumber,
    };
    
    setMovements(prev => [...prev, newMovement]);
    
    // Update batch stock
    setBatches(prev => 
      prev.map(batch => {
        if (batch.id === formData.batchId) {
          const newStock = formData.type === 'in' 
            ? batch.currentStock + formData.quantity
            : batch.currentStock - formData.quantity;
          
          return { ...batch, currentStock: newStock };
        }
        return batch;
      })
    );
    
    toast.success(`Estoque ${formData.type === 'in' ? 'recebido' : 'dispensado'} com sucesso`);
    setShowModal(false);
  };

  const columns = [
    { 
      header: 'Tipo', 
      accessor: 'type' as keyof InventoryMovement,
      cell: (movement: InventoryMovement) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          movement.type === 'in' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {movement.type === 'in' ? (
            <>
              <TrendingUp size={12} className="mr-1" />
              Entrada
            </>
          ) : (
            <>
              <TrendingDown size={12} className="mr-1" />
              Saída
            </>
          )}
        </span>
      )
    },
    { header: 'Medicamento', accessor: 'medicationName' as keyof InventoryMovement },
    { header: 'Código do Lote', accessor: 'batchNumber' as keyof InventoryMovement },
    { 
      header: 'Quantidade', 
      accessor: 'quantity' as keyof InventoryMovement,
      cell: (movement: InventoryMovement) => movement.quantity
    },
    { header: 'Data', accessor: 'date' as keyof InventoryMovement },
    { header: 'Usuário', accessor: 'user' as keyof InventoryMovement },
    { 
      header: 'Observações', 
      accessor: 'notes' as keyof InventoryMovement,
      cell: (movement: InventoryMovement) => (
        <div className="max-w-xs truncate" title={movement.notes}>
          {movement.notes}
        </div>
      )
    },
  ];

  const getMaxQuantity = () => {
    if (formData.type === 'out' && formData.batchId) {
      const batch = batches.find(b => b.id === formData.batchId);
      return batch ? batch.currentStock : 0;
    }
    return undefined;
  };

  const getCurrentStock = () => {
    if (formData.batchId) {
      const batch = batches.find(b => b.id === formData.batchId);
      return batch ? batch.currentStock : 0;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Movimentações de Estoque</h1>
        {canManageInventory && (
          <button
            onClick={handleAddMovement}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>Adicionar Movimentação</span>
          </button>
        )}
      </div>

      <DataTable
        data={movements}
        columns={columns}
        title="Histórico de Movimentações de Estoque"
        exportFilename="movimentacoes-estoque"
      />

      {/* Modal Adicionar Movimentação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Registrar Movimentação de Estoque
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Movimentação
                  </label>
                  <div className="mt-1 flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="in"
                        checked={formData.type === 'in'}
                        onChange={() => setFormData(prev => ({ ...prev, type: 'in' }))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Entrada de Estoque</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="out"
                        checked={formData.type === 'out'}
                        onChange={() => setFormData(prev => ({ ...prev, type: 'out' }))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Saída de Estoque</span>
                    </label>
                  </div>
                </div>
                
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
                
                <div>
                  <label htmlFor="batchId" className="block text-sm font-medium text-gray-700">
                    Lote
                  </label>
                  <select
                    id="batchId"
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.medicationId}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Selecionar Lote</option>
                    {filteredBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchNumber} - Estoque: {batch.currentStock} - Validade: {batch.expiryDate}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.batchId > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      Estoque atual para este lote: <span className="font-semibold">{getCurrentStock()}</span>
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
                    max={getMaxQuantity()}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Data
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
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
                    value={formData.notes}
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;