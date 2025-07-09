// src/components/Common/FilterBar.tsx
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { Input } from './Input'; // Supondo que você tenha um componente de Input comum
import { Select } from './Select';

const FilterWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-end;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1 1 150px; // Permite que os campos quebrem a linha em telas menores
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  operator: string; // Ex: 'ct' (contains), 'eq' (equals)
  options?: { value: string; label: string }[]; // Para selects
}

interface FilterBarProps {
  filters: FilterOption[];
  onApplyFilters: (filterString: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onApplyFilters }) => {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleInputChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = useCallback(() => {
    const filterString = filters
      .map(filter => {
        const value = filterValues[filter.key];
        if (value) {
          // Formato: campo+operador+valor
          return `${filter.key}+${filter.operator}+${value}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('$'); // Usa '$' como separador AND

    onApplyFilters(filterString);
  }, [filterValues, filters, onApplyFilters]);

  return (
    <FilterWrapper>
      {filters.map(filter => (
        <FilterField key={filter.key}>
          <Label htmlFor={filter.key}>{filter.label}</Label>
          {filter.type === 'select' ? (
            <Select
              id={filter.key}
              value={filterValues[filter.key] || ''}
              onChange={e => handleInputChange(filter.key, e.target.value)}
              // Estilizar o select se necessário
            >
              <option value="">Todos</option>
              {filter.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          ) : (
            <Input
              id={filter.key}
              type={filter.type}
              value={filterValues[filter.key] || ''}
              onChange={e => handleInputChange(filter.key, e.target.value)}
            />
          )}
        </FilterField>
      ))}
      <Button primary onClick={handleApply}>Aplicar Filtros</Button>
    </FilterWrapper>
  );
};

export default FilterBar;

// Crie também um componente Input genérico se não tiver um
// src/components/Common/Input.tsx
// import styled from 'styled-components';
// export const Input = styled.input` ... `;