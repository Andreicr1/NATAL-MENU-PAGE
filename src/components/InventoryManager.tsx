import React, { useState, useEffect } from 'react';
import { getInventory, updateInventory } from '../utils/awsApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface InventoryManagerProps {
  productId: string;
  productName: string;
}

export function InventoryManager({ productId, productName }: InventoryManagerProps) {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    loadInventory();
  }, [productId]);

  const loadInventory = async () => {
    try {
      const inventory = await getInventory(productId);
      setQuantity(inventory.quantity);
    } catch (error) {
      toast.error('Erro ao carregar estoque');
    }
  };

  const handleUpdate = async (operation: 'set' | 'increment' | 'decrement') => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value < 0) {
      toast.error('Valor inválido');
      return;
    }

    setLoading(true);
    try {
      const result = await updateInventory(productId, value, operation);
      setQuantity(result.quantity);
      setInputValue('');
      toast.success('Estoque atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div>
        <h3 className="font-semibold">{productName}</h3>
        <p className="text-sm text-gray-600">Estoque atual: {quantity} unidades</p>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Quantidade"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleUpdate('set')}
          disabled={loading}
          variant="outline"
        >
          Definir
        </Button>
        <Button
          onClick={() => handleUpdate('increment')}
          disabled={loading}
          variant="outline"
        >
          + Adicionar
        </Button>
        <Button
          onClick={() => handleUpdate('decrement')}
          disabled={loading}
          variant="outline"
        >
          - Remover
        </Button>
      </div>
    </div>
  );
}
