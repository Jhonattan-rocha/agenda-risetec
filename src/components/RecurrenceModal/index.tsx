// src/components/RecurrenceModal/index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { RRule, Weekday, type Options, rrulestr, Frequency } from 'rrule';
import { format, parseISO } from 'date-fns';
import { Button } from '../Common';
import {
    ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    FormGroup, Label, Row, Select, Input, WeekdayButton, Summary
} from './styled';
import { getText } from '../../utils/dateUtils';

interface RecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rruleString: string) => void;
  initialRRule?: string;
  startDate: Date;
}

const weekdayMap = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const RecurrenceModal: React.FC<RecurrenceModalProps> = ({ isOpen, onClose, onSave, initialRRule, startDate }) => {
    const [freq, setFreq] = useState<number>(RRule.WEEKLY);
    const [interval, setInterval] = useState(1);
    const [weekdays, setWeekdays] = useState<Weekday[]>([]);
    const [until, setUntil] = useState<Date | null>(null);
    const [count, setCount] = useState<number | null>(null);
    const [terminationType, setTerminationType] = useState<'never' | 'on' | 'after'>('never');

    useEffect(() => {
        if (isOpen) {
            // CORREÇÃO 1: Lógica para carregar o estado de edição de uma regra existente
            if (initialRRule) {
                try {
                    const ruleOrSet = rrulestr(initialRRule);
                    
                    // Verificamos se é um RRuleSet e pegamos as opções da primeira RRULE,
                    // caso contrário, pegamos as opções do RRule simples.
                    const ruleOptions = (ruleOrSet as any)._rrule 
                        ? (ruleOrSet as any)._rrule[0].origOptions 
                        : (ruleOrSet as RRule).origOptions;

                    setFreq(ruleOptions.freq as Frequency);
                    setInterval(ruleOptions.interval || 1);

                    // Garante que byweekday seja sempre um array
                    if (ruleOptions.byweekday) {
                        const byweekdayArray = Array.isArray(ruleOptions.byweekday) ? ruleOptions.byweekday : [ruleOptions.byweekday];
                        setWeekdays(byweekdayArray as Weekday[]);
                    } else {
                        setWeekdays([weekdayMap[startDate.getDay()]]);
                    }

                    if (ruleOptions.until) {
                        setTerminationType('on');
                        const untilDate = new Date(ruleOptions.until);
                        untilDate.setMinutes(untilDate.getMinutes() + untilDate.getTimezoneOffset());
                        setUntil(untilDate);
                        setCount(null);
                    } else if (ruleOptions.count) {
                        setTerminationType('after');
                        setCount(ruleOptions.count);
                        setUntil(null);
                    } else {
                        setTerminationType('never');
                        setUntil(null);
                        setCount(null);
                    }
                } catch (e) {
                    console.error("Erro ao parsear a regra de recorrência:", e);
                    // Reseta para o padrão se a regra for inválida
                    setFreq(RRule.WEEKLY);
                    setInterval(1);
                    setWeekdays([weekdayMap[startDate.getDay()]]);
                    setTerminationType('never');
                }
            } else {
                // Estado padrão para uma nova regra
                setFreq(RRule.WEEKLY);
                setInterval(1);
                setWeekdays([weekdayMap[startDate.getDay()]]);
                setTerminationType('never');
                setUntil(null);
                setCount(null);
            }
        }
    }, [isOpen, initialRRule, startDate]);

    // O useEffect vai cuidar de adicionar e remover o event listener
    useEffect(() => {
        // 1. Criamos a função que vai lidar com a tecla pressionada
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                // Se a tecla for "Escape", chamamos a função para fechar o modal
                onClose();
            }
        };
        // 2. Adicionamos o listener apenas se o modal estiver aberto
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        // 3. A "função de limpeza" do useEffect: ESSA PARTE É CRUCIAL!
        // Ela será executada quando o componente for "desmontado" ou antes de o efeito rodar novamente.
        return () => {
            // Removemos o listener para evitar memory leaks (vazamentos de memória)
            // e para que ele não continue "escutando" depois que o modal fechar.
            document.removeEventListener('keydown', handleKeyDown);
        };
        // O efeito depende de `isOpen` e `onClose`. Ele vai re-executar se um deles mudar.
    }, [isOpen, onClose]);
    
    const handleWeekdayToggle = (day: Weekday) => {
        setWeekdays(prev => 
            prev.some(d => d.weekday === day.weekday)
            ? prev.filter(d => d.weekday !== day.weekday)
            : [...prev, day]
        );
    };

    // CORREÇÃO 2: Lógica de limpeza de estado ao mudar o tipo de término
    const handleTerminationChange = (type: 'never' | 'on' | 'after') => {
        setTerminationType(type);
        if (type === 'never') {
            setUntil(null);
            setCount(null);
        } else if (type === 'on') {
            setCount(null);
        } else if (type === 'after') {
            setUntil(null);
        }
    };

    const ruleSummary = useMemo(() => {
        try {
            const rule = new RRule({
                freq,
                interval,
                byweekday: freq === RRule.WEEKLY ? weekdays : null,
                dtstart: startDate,
                until,
                count,
            });
            const result = rule.toText().split(" ").map(text => getText(text.replace(/[.,!?;:'"()\[\]{}\-]/g, ''))).join(" ");
            return result
        } catch {
            return "Regra de repetição inválida.";
        }
    }, [freq, interval, weekdays, startDate, until, count]);

    const handleSave = () => {
        if (freq === null || freq === undefined) {
            onSave('');
            return;
        }
        const options: Partial<Options> = {
            freq,
            interval,
            dtstart: startDate,
            byweekday: (freq === RRule.WEEKLY && weekdays.length > 0) ? weekdays : null,
            until: terminationType === 'on' ? until : null,
            count: terminationType === 'after' ? count : null,
        };
        const rule = new RRule(options);
        onSave(rule.toString());
        onClose();
    };

    // NOVO: Função para limpar/resetar o formulário
    const handleClear = () => {
        onSave(''); // Salva uma string vazia, que significa "Nunca"
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalContent $isOpen={isOpen} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2>Configurações de repetição</h2>
                    <button onClick={onClose}>&times;</button>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Tipo:</Label>
                        <Select value={freq} onChange={e => setFreq(Number(e.target.value))}>
                            <option value={RRule.DAILY}>Diário</option>
                            <option value={RRule.WEEKLY}>Semanal</option>
                            <option value={RRule.MONTHLY}>Mensal</option>
                            <option value={RRule.YEARLY}>Anual</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>Intervalo:</Label>
                        <Row>
                            <Input type="number" min="1" value={interval} onChange={e => setInterval(Number(e.target.value))} />
                            <span>
                                {freq === RRule.DAILY && 'dias'}
                                {freq === RRule.WEEKLY && 'semanas'}
                                {freq === RRule.MONTHLY && 'meses'}
                                {freq === RRule.YEARLY && 'anos'}
                            </span>
                        </Row>
                    </FormGroup>

                    {freq === RRule.WEEKLY && (
                        <FormGroup>
                            <Label>Dias:</Label>
                            <Row>
                                {weekdayMap.map((day, index) => (
                                    <WeekdayButton 
                                        key={index}
                                        $isSelected={weekdays.some(d => d.weekday === day.weekday)}
                                        onClick={() => handleWeekdayToggle(day)}
                                    >
                                        {weekdayLabels[index]}
                                    </WeekdayButton>
                                ))}
                            </Row>
                        </FormGroup>
                    )}

                    <FormGroup>
                        <Label>Termina em:</Label>
                        <div>
                            <Row>
                                <input type="radio" id="never" name="termination" checked={terminationType === 'never'} onChange={() => handleTerminationChange('never')} />
                                <label htmlFor="never">Nunca</label>
                            </Row>
                            <Row>
                                <input type="radio" id="after" name="termination" checked={terminationType === 'after'} onChange={() => handleTerminationChange('after')} />
                                <label htmlFor="after">Depois de</label>
                                <Input type="number" min="1" disabled={terminationType !== 'after'} value={count || ''} onChange={e => setCount(Number(e.target.value))} />
                                <span>ocorrências</span>
                            </Row>
                            <Row>
                                <input type="radio" id="on" name="termination" checked={terminationType === 'on'} onChange={() => handleTerminationChange('on')} />
                                <label htmlFor="on">Em</label>
                                <Input type="date" disabled={terminationType !== 'on'} value={until ? format(until, 'yyyy-MM-dd') : ''} onChange={e => setUntil(e.target.value ? parseISO(e.target.value) : null)} />
                            </Row>
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label>Resumo:</Label>
                        <Summary>{ruleSummary}</Summary>
                    </FormGroup>

                </ModalBody>
                <ModalFooter>
                    <Button outline danger onClick={handleClear}>Limpar</Button>
                    <Button outline onClick={onClose}>Cancelar</Button>
                    <Button primary onClick={handleSave}>Salvar</Button>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

export default RecurrenceModal;