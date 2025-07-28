// src/utils/timeConverter.ts

export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
const MINUTES_IN_WEEK = 7 * MINUTES_IN_DAY;

/**
 * Converte um valor e unidade de tempo para o total de minutos.
 * @param value O valor numérico.
 * @param unit A unidade de tempo.
 * @returns O total de minutos.
 */
export const convertToMinutes = (value: number, unit: TimeUnit): number => {
  switch (unit) {
    case 'weeks':
      return value * MINUTES_IN_WEEK;
    case 'days':
      return value * MINUTES_IN_DAY;
    case 'hours':
      return value * MINUTES_IN_HOUR;
    case 'minutes':
    default:
      return value;
  }
};

/**
 * Converte um total de minutos para a unidade mais legível (semanas, dias, horas).
 * @param totalMinutes O total de minutos.
 * @returns Um array com o valor e a unidade. Ex: [2, 'days']
 */
export const convertFromMinutes = (totalMinutes?: number | null): [number, TimeUnit] => {
  if (totalMinutes === null || totalMinutes === undefined || totalMinutes <= 0) {
    return [30, 'minutes']; // Retorna um padrão caso não haja valor
  }

  if (totalMinutes % MINUTES_IN_WEEK === 0) {
    return [totalMinutes / MINUTES_IN_WEEK, 'weeks'];
  }
  if (totalMinutes % MINUTES_IN_DAY === 0) {
    return [totalMinutes / MINUTES_IN_DAY, 'days'];
  }
  if (totalMinutes % MINUTES_IN_HOUR === 0) {
    return [totalMinutes / MINUTES_IN_HOUR, 'hours'];
  }
  return [totalMinutes, 'minutes'];
};