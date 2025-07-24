// src/components/RecurrenceModal/index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Frequency, RRule, Weekday, type Options } from 'rrule';
import { fromText } from 'rrule/dist/esm/nlp';
import { format, parseISO } from 'date-fns';
import { Button } from '../Common';
import {
    ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    FormGroup, Label, Row, Select, Input, WeekdayButton, Summary
} from './styled';

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
            if (initialRRule) {
                try {
                    // CORREÇÃO 3: Usar .origOptions para pegar a configuração original da regra
                    const ruleOptions = fromText(initialRRule).origOptions;
                    setFreq(ruleOptions.freq as Frequency);
                    setInterval(ruleOptions.interval || 1);
                    setWeekdays(ruleOptions.byweekday ? (Array.isArray(ruleOptions.byweekday) ? ruleOptions.byweekday as Weekday[] : [ruleOptions.byweekday as Weekday]) : [weekdayMap[startDate.getDay()]]);
                    if (ruleOptions.until) {
                        setTerminationType('on');
                        const untilDate = new Date(ruleOptions.until);
                        // Ajusta para o fuso horário local para exibir corretamente no input date
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
                    setWeekdays([weekdayMap[startDate.getDay()]]);
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
    
    const handleWeekdayToggle = (day: Weekday) => {
        setWeekdays(prev => 
            prev.some(d => d.weekday === day.weekday)
            ? prev.filter(d => d.weekday !== day.weekday)
            : [...prev, day]
        );
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
             // CORREÇÃO 4: A tradução agora funciona pois rrulestr foi importado do local correto
            return rule.toText();
        } catch {
            return "Regra de repetição inválida.";
        }
    }, [freq, interval, weekdays, startDate, until, count]);

    const handleSave = () => {
        if (freq === null || freq === undefined) {
            onSave('');
            return;
        }
        // CORREÇÃO 5: Usar o tipo 'Options' importado
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
                            <input type="radio" id="never" name="termination" checked={terminationType === 'never'} onChange={() => setTerminationType('never')} />
                            <label htmlFor="never">Nunca</label>
                        </Row>
                        <Row>
                            <input type="radio" id="after" name="termination" checked={terminationType === 'after'} onChange={() => setTerminationType('after')} />
                            <label htmlFor="after">Depois de</label>
                            <Input type="number" min="1" disabled={terminationType !== 'after'} value={count || ''} onChange={e => setCount(Number(e.target.value))} />
                            <span>ocorrências</span>
                        </Row>
                         <Row>
                            <input type="radio" id="on" name="termination" checked={terminationType === 'on'} onChange={() => setTerminationType('on')} />
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
                <Button outline onClick={onClose}>Cancelar</Button>
                <Button primary onClick={handleSave}>Salvar</Button>
            </ModalFooter>
        </ModalContent>
    </ModalOverlay>
  );
};

export default RecurrenceModal;