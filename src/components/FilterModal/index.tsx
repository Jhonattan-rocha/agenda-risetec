// src/components/FilterModal/index.tsx
import React, { useState, useCallback } from 'react';
import { Button, Select, Input } from '../Common';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import {
    ModalOverlay, ModalContent, ModalHeader, FilterGroupContainer,
    FilterRow, OperatorSelector, AddButton, ModalFooter
} from './styled';

// --- Interfaces e Tipos ---

export interface FilterOption {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date';
    operator: string;
    options?: { value: string; label: string }[];
}

interface FilterRule {
    id: string;
    field: string;
    operator: string;
    value: string;
}

interface FilterGroup {
    id: string;
    operator: 'AND' | 'OR';
    rules: FilterRule[];
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterOption[];
    onApplyFilters: (filterString: string) => void;
}

// Lista de operadores disponíveis para escolha do usuário
const availableOperators = [
    { value: 'eq', label: 'Igual a' },
    { value: 'ne', label: 'Diferente de' },
    { value: 'ct', label: 'Contém' },
    { value: 'gt', label: 'Maior que' },
    { value: 'lt', label: 'Menor que' },
    { value: 'ge', label: 'Maior ou Igual a' },
    { value: 'le', label: 'Menor ou Igual a' },
    { value: 'sw', label: 'Começa com' },
    { value: 'ew', label: 'Termina com' },
];

// --- Componente Principal ---

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, onApplyFilters }) => {
    // Estado inicial com um grupo e uma regra vazia
    const [groups, setGroups] = useState<FilterGroup[]>([
        { id: uuidv4(), operator: 'AND', rules: [{ id: uuidv4(), field: '', operator: 'ct', value: '' }] }
    ]);

    // --- Funções de Manipulação de Estado ---

    const handleGroupOperatorChange = (groupId: string, operator: 'AND' | 'OR') => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, operator } : g));
    };

    const handleRuleChange = (groupId: string, ruleId: string, newRule: Partial<FilterRule>) => {
        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    rules: g.rules.map(r => r.id === ruleId ? { ...r, ...newRule } : r)
                };
            }
            return g;
        }));
    };

    const addRule = (groupId: string) => {
        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return { ...g, rules: [...g.rules, { id: uuidv4(), field: '', operator: 'ct', value: '' }] };
            }
            return g;
        }));
    };

    const removeRule = (groupId: string, ruleId: string) => {
        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                // Não permite remover a última regra de um grupo
                if (g.rules.length > 1) {
                    return { ...g, rules: g.rules.filter(r => r.id !== ruleId) };
                }
            }
            return g;
        }));
    };

    const addGroup = () => {
        setGroups(prev => [...prev, { id: uuidv4(), operator: 'AND', rules: [{ id: uuidv4(), field: '', operator: 'ct', value: '' }] }]);
    };

    const removeGroup = (groupId: string) => {
        // Não permite remover o último grupo
        if (groups.length > 1) {
            setGroups(prev => prev.filter(g => g.id !== groupId));
        }
    };

    // --- Lógica Principal de Aplicação dos Filtros ---

    const handleApply = useCallback(() => {
        const groupStrings = groups.map(group => {
            const ruleStrings = group.rules
                .map(rule => {
                    if (rule.field && rule.operator && rule.value) {
                        return `${rule.field}+${rule.operator}+${rule.value}`;
                    }
                    return null;
                })
                .filter(Boolean);

            if (ruleStrings.length > 0) {
                const groupOperator = group.operator === 'AND' ? '$' : '|';
                return ruleStrings.join(groupOperator);
            }
            return null;
        }).filter(Boolean);
        
        // Une os diferentes grupos com o operador AND ($)
        const finalFilterString = groupStrings.join('$');

        onApplyFilters(finalFilterString);
        onClose();
    }, [groups, onApplyFilters, onClose]);


    if (!isOpen) return null;

    // --- Renderização do Componente ---

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalContent $isOpen={isOpen} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2>Filtros Avançados</h2>
                    <button onClick={onClose}>&times;</button>
                </ModalHeader>

                {groups.map((group) => (
                    <FilterGroupContainer key={group.id}>
                        {groups.length > 1 && (
                            <Button danger small onClick={() => removeGroup(group.id)} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                <FaTrash />
                            </Button>
                        )}
                        <OperatorSelector>
                            <label>Unir regras com:</label>
                            <Select value={group.operator} onChange={e => handleGroupOperatorChange(group.id, e.target.value as 'AND' | 'OR')}>
                                <option value="AND">E (AND)</option>
                                <option value="OR">OU (OR)</option>
                            </Select>
                        </OperatorSelector>

                        {group.rules.map(rule => {
                            const selectedField = filters.find(f => f.key === rule.field);
                            return (
                                <FilterRow key={rule.id}>
                                    <Select
                                        value={rule.field}
                                        onChange={e => handleRuleChange(group.id, rule.id, { field: e.target.value, operator: '', value: '' })}
                                    >
                                        <option value="" disabled>Selecione um campo</option>
                                        {filters.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                                    </Select>

                                    <Select
                                        value={rule.operator}
                                        onChange={e => handleRuleChange(group.id, rule.id, { operator: e.target.value })}
                                        disabled={!rule.field}
                                    >
                                        <option value="" disabled>Operador</option>
                                        {availableOperators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                                    </Select>

                                    {selectedField?.type === 'select' ? (
                                        <Select value={rule.value} onChange={e => handleRuleChange(group.id, rule.id, { value: e.target.value })} disabled={!rule.operator}>
                                            <option value="">Selecione...</option>
                                            {selectedField.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </Select>
                                    ) : (
                                        <Input type={selectedField?.type || 'text'} placeholder="Valor" value={rule.value} onChange={e => handleRuleChange(group.id, rule.id, { value: e.target.value })} disabled={!rule.operator} />
                                    )}

                                    <Button danger small onClick={() => removeRule(group.id, rule.id)} disabled={group.rules.length <= 1}>
                                        <FaTrash />
                                    </Button>
                                </FilterRow>
                            );
                        })}
                        <AddButton onClick={() => addRule(group.id)}><FaPlus /> Adicionar Regra</AddButton>
                    </FilterGroupContainer>
                ))}

                <Button outline onClick={addGroup}><FaPlus /> Adicionar Grupo de Filtro</Button>

                <ModalFooter>
                    <Button outline onClick={onClose}>Cancelar</Button>
                    <Button outline onClick={() => {
                        setGroups([
                            { id: uuidv4(), operator: 'AND', rules: [{ id: uuidv4(), field: '', operator: 'ct', value: '' }] }
                        ])
                        onApplyFilters("");
                        onClose()
                    }}>Limpar</Button>
                    <Button primary onClick={handleApply}>Aplicar Filtros</Button>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

export default FilterModal;