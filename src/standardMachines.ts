import { strings } from './strings';
import type { Machine } from './types';

export const standardMachines: Machine[] = [
  {
    id: 'standard-leg-press',
    name: strings.standardMachines.legPress.name,
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    note: strings.standardMachines.legPress.note,
  },
  {
    id: 'standard-leg-extension',
    name: strings.standardMachines.legExtension.name,
    muscleGroups: ['quads'],
    note: strings.standardMachines.legExtension.note,
  },
  {
    id: 'standard-seated-leg-curl',
    name: strings.standardMachines.seatedLegCurl.name,
    muscleGroups: ['hamstrings'],
    note: strings.standardMachines.seatedLegCurl.note,
  },
  {
    id: 'standard-lying-leg-curl',
    name: strings.standardMachines.lyingLegCurl.name,
    muscleGroups: ['hamstrings'],
    note: strings.standardMachines.lyingLegCurl.note,
  },
  {
    id: 'standard-hip-adduction',
    name: strings.standardMachines.hipAdduction.name,
    muscleGroups: ['adductors'],
    note: strings.standardMachines.hipAdduction.note,
  },
  {
    id: 'standard-hip-abduction',
    name: strings.standardMachines.hipAbduction.name,
    muscleGroups: ['abductors', 'glutes'],
    note: strings.standardMachines.hipAbduction.note,
  },
  {
    id: 'standard-calf-raise',
    name: strings.standardMachines.calfRaise.name,
    muscleGroups: ['calves'],
    note: strings.standardMachines.calfRaise.note,
  },
  {
    id: 'standard-glute-kickback',
    name: strings.standardMachines.gluteKickback.name,
    muscleGroups: ['glutes', 'hamstrings'],
    note: strings.standardMachines.gluteKickback.note,
  },
  {
    id: 'standard-chest-press',
    name: strings.standardMachines.chestPress.name,
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    note: strings.standardMachines.chestPress.note,
  },
  {
    id: 'standard-incline-chest-press',
    name: strings.standardMachines.inclineChestPress.name,
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    note: strings.standardMachines.inclineChestPress.note,
  },
  {
    id: 'standard-pec-deck',
    name: strings.standardMachines.pecDeck.name,
    muscleGroups: ['chest'],
    note: strings.standardMachines.pecDeck.note,
  },
  {
    id: 'standard-shoulder-press',
    name: strings.standardMachines.shoulderPress.name,
    muscleGroups: ['shoulders', 'triceps'],
    note: strings.standardMachines.shoulderPress.note,
  },
  {
    id: 'standard-lateral-raise',
    name: strings.standardMachines.lateralRaise.name,
    muscleGroups: ['shoulders'],
    note: strings.standardMachines.lateralRaise.note,
  },
  {
    id: 'standard-lat-pulldown',
    name: strings.standardMachines.latPulldown.name,
    muscleGroups: ['back', 'biceps'],
    note: strings.standardMachines.latPulldown.note,
  },
  {
    id: 'standard-seated-row',
    name: strings.standardMachines.seatedRow.name,
    muscleGroups: ['back', 'biceps'],
    note: strings.standardMachines.seatedRow.note,
  },
  {
    id: 'standard-high-row',
    name: strings.standardMachines.highRow.name,
    muscleGroups: ['back', 'biceps', 'traps'],
    note: strings.standardMachines.highRow.note,
  },
  {
    id: 'standard-machine-pullover',
    name: strings.standardMachines.machinePullover.name,
    muscleGroups: ['back'],
    note: strings.standardMachines.machinePullover.note,
  },
  {
    id: 'standard-back-extension',
    name: strings.standardMachines.backExtension.name,
    muscleGroups: ['lowerBack', 'glutes', 'hamstrings'],
    note: strings.standardMachines.backExtension.note,
  },
  {
    id: 'standard-biceps-curl',
    name: strings.standardMachines.bicepsCurl.name,
    muscleGroups: ['biceps', 'forearms'],
    note: strings.standardMachines.bicepsCurl.note,
  },
  {
    id: 'standard-triceps-extension',
    name: strings.standardMachines.tricepsExtension.name,
    muscleGroups: ['triceps'],
    note: strings.standardMachines.tricepsExtension.note,
  },
  {
    id: 'standard-assisted-pull-up-dip',
    name: strings.standardMachines.assistedPullUpDip.name,
    muscleGroups: ['back', 'biceps', 'chest', 'triceps'],
    note: strings.standardMachines.assistedPullUpDip.note,
  },
  {
    id: 'standard-abdominal-crunch',
    name: strings.standardMachines.abdominalCrunch.name,
    muscleGroups: ['abs'],
    note: strings.standardMachines.abdominalCrunch.note,
  },
  {
    id: 'standard-torso-rotation',
    name: strings.standardMachines.torsoRotation.name,
    muscleGroups: ['abs'],
    note: strings.standardMachines.torsoRotation.note,
  },
];
