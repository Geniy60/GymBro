import type { Workout, WorkoutExercise, WorkoutSet } from '../../types';
import { addSetToExercise } from './workoutSessionModel';

export type WorkoutSessionDraftState = {
  collapsedExerciseIds: string[];
  draftWorkout: Workout;
  visibleSetNoteIds: string[];
};

export type WorkoutSessionDraftAction =
  | {
      type: 'addExercises';
      exercises: WorkoutExercise[];
    }
  | {
      type: 'addSet';
      exerciseId: string;
    }
  | {
      type: 'clearExerciseSets';
      exerciseId: string;
    }
  | {
      type: 'collapseExercise';
      exerciseId: string;
    }
  | {
      type: 'deleteExercise';
      exerciseId: string;
    }
  | {
      type: 'moveExercise';
      exerciseId: string;
      toIndex: number;
    }
  | {
      type: 'deleteSet';
      exerciseId: string;
      setId: string;
    }
  | {
      type: 'replaceWorkout';
      workout: Workout;
    }
  | {
      type: 'toggleExerciseCollapse';
      exerciseId: string;
    }
  | {
      type: 'toggleSetNote';
      setId: string;
    }
  | {
      type: 'updateSet';
      exerciseId: string;
      field: keyof WorkoutSet;
      setId: string;
      value: string;
    }
  | {
      type: 'updateWorkoutName';
      name: string;
    };

export function createWorkoutSessionDraftState(
  workout: Workout,
): WorkoutSessionDraftState {
  return {
    collapsedExerciseIds: workout.exercises.map((exercise) => exercise.id),
    draftWorkout: workout,
    visibleSetNoteIds: [],
  };
}

export function workoutSessionDraftReducer(
  state: WorkoutSessionDraftState,
  action: WorkoutSessionDraftAction,
): WorkoutSessionDraftState {
  switch (action.type) {
    case 'addExercises':
      return {
        ...state,
        collapsedExerciseIds: state.draftWorkout.exercises.map(
          (exercise) => exercise.id,
        ),
        draftWorkout: {
          ...state.draftWorkout,
          exercises: [...state.draftWorkout.exercises, ...action.exercises],
        },
      };

    case 'addSet':
      return updateExercises(state, (exercise) =>
        exercise.id === action.exerciseId ? addSetToExercise(exercise) : exercise,
      );

    case 'clearExerciseSets':
      return clearExerciseSets(state, action.exerciseId);

    case 'collapseExercise':
      if (
        state.collapsedExerciseIds.includes(action.exerciseId) ||
        !state.draftWorkout.exercises.some((exercise) => exercise.id === action.exerciseId)
      ) {
        return state;
      }

      return {
        ...state,
        collapsedExerciseIds: [...state.collapsedExerciseIds, action.exerciseId],
      };

    case 'moveExercise': {
      const exercises = [...state.draftWorkout.exercises];
      const fromIndex = exercises.findIndex((exercise) => exercise.id === action.exerciseId);

      if (
        fromIndex < 0 ||
        action.toIndex < 0 ||
        action.toIndex >= exercises.length ||
        fromIndex === action.toIndex
      ) {
        return state;
      }

      const [exercise] = exercises.splice(fromIndex, 1);
      exercises.splice(action.toIndex, 0, exercise);

      return {
        ...state,
        draftWorkout: { ...state.draftWorkout, exercises },
      };
    }

    case 'deleteExercise':
      return {
        ...state,
        collapsedExerciseIds: state.collapsedExerciseIds.filter(
          (currentId) => currentId !== action.exerciseId,
        ),
        draftWorkout: {
          ...state.draftWorkout,
          exercises: state.draftWorkout.exercises.filter(
            (exercise) => exercise.id !== action.exerciseId,
          ),
        },
      };

    case 'deleteSet':
      return {
        ...updateExercises(state, (exercise) =>
          exercise.id === action.exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.filter(
                  (workoutSet) => workoutSet.id !== action.setId,
                ),
              }
            : exercise,
        ),
        visibleSetNoteIds: state.visibleSetNoteIds.filter(
          (currentId) => currentId !== action.setId,
        ),
      };

    case 'replaceWorkout':
      return {
        ...state,
        draftWorkout: action.workout,
      };

    case 'toggleExerciseCollapse':
      return {
        ...state,
        collapsedExerciseIds: toggleId(
          state.collapsedExerciseIds,
          action.exerciseId,
        ),
      };

    case 'toggleSetNote':
      return {
        ...state,
        visibleSetNoteIds: toggleId(state.visibleSetNoteIds, action.setId),
      };

    case 'updateSet':
      return updateExercises(state, (exercise) =>
        exercise.id === action.exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((workoutSet) =>
                workoutSet.id === action.setId
                  ? {
                      ...workoutSet,
                      [action.field]: action.value,
                    }
                  : workoutSet,
              ),
            }
          : exercise,
      );

    case 'updateWorkoutName':
      return {
        ...state,
        draftWorkout: {
          ...state.draftWorkout,
          name: action.name,
        },
      };
  }
}

function clearExerciseSets(
  state: WorkoutSessionDraftState,
  exerciseId: string,
): WorkoutSessionDraftState {
  return updateExercises(state, (exercise) => {
    if (exercise.id !== exerciseId || exercise.trackingType === 'group') {
      return exercise;
    }

    return {
      ...exercise,
      sets: exercise.sets.map((workoutSet) =>
        exercise.trackingType === 'cardio'
          ? {
              ...workoutSet,
              distanceKm: '',
              durationMinutes: '',
              elevationMeters: '',
            }
          : { ...workoutSet, reps: '' },
      ),
    };
  });
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id)
    ? ids.filter((currentId) => currentId !== id)
    : [...ids, id];
}

function updateExercises(
  state: WorkoutSessionDraftState,
  updateExercise: (exercise: WorkoutExercise) => WorkoutExercise,
): WorkoutSessionDraftState {
  return {
    ...state,
    draftWorkout: {
      ...state.draftWorkout,
      exercises: state.draftWorkout.exercises.map(updateExercise),
    },
  };
}
