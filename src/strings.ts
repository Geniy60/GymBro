export const strings = {
  app: {
    title: 'GymBro',
  },
  tabs: {
    machines: 'Тренажеры',
    workouts: 'Тренировки',
  },
  search: {
    machines: 'Поиск тренажера',
    workouts: 'Поиск тренировки',
  },
  empty: {
    machines: {
      title: 'Тренажеров пока нет',
      message: 'Здесь появятся тренажеры, которые ты добавишь для своих занятий.',
    },
    workouts: {
      title: 'Тренировок пока нет',
      message: 'Здесь появятся тренировки, которые ты соберешь для зала.',
    },
    filtered: {
      title: 'Ничего не найдено',
      message: 'Попробуй изменить запрос или сбросить поиск.',
    },
  },
  actions: {
    cancel: 'Отмена',
    addIcon: '+',
    delete: 'Удалить',
    deleteIcon: '×',
    editIcon: '✎',
    resetSearch: 'Сбросить поиск',
    save: 'Сохранить',
  },
  alerts: {
    deleteMachineTitle: 'Удалить тренажер?',
    deleteMachineMessage: (name: string) =>
      `Тренажер «${name}» будет удален из списка.`,
    deleteWorkoutTitle: 'Удалить тренировку?',
    deleteWorkoutMessage: (name: string) =>
      `Тренировка «${name}» будет удалена из списка.`,
    storageLoadTitle: 'Не удалось загрузить данные',
    storageLoadMessage: 'Попробуй открыть приложение еще раз.',
    storageSaveTitle: 'Не удалось сохранить данные',
    storageSaveMessage: 'Проверь свободное место на устройстве и попробуй снова.',
  },
  forms: {
    machine: {
      addTitle: 'Новый тренажер',
      editTitle: 'Редактировать тренажер',
      nameLabel: 'Название',
      namePlaceholder: 'Например, жим ногами',
      muscleGroupLabel: 'Группа мышц',
      muscleGroupPlaceholder: 'Например, ноги',
      noteLabel: 'Заметка',
      notePlaceholder: 'Посадка, настройки, важные ощущения',
      errors: {
        nameRequired: 'Введите название тренажера.',
      },
    },
    workout: {
      addTitle: 'Новая тренировка',
      editTitle: 'Редактировать тренировку',
      nameLabel: 'Название',
      namePlaceholder: 'Например, День ног',
      noteLabel: 'Заметка',
      notePlaceholder: 'Цель, порядок упражнений или важные ощущения',
      errors: {
        nameRequired: 'Введите название тренировки.',
      },
    },
  },
  accessibility: {
    addMachine: 'Добавить тренажер',
    addWorkout: 'Добавить тренировку',
    back: 'Назад',
    deleteMachine: 'Удалить тренажер',
    deleteWorkout: 'Удалить тренировку',
    editMachine: 'Редактировать тренажер',
    editWorkout: 'Редактировать тренировку',
    settings: 'Открыть настройки',
    search: 'Поиск',
    clearSearch: 'Очистить поиск',
    saveMachine: 'Сохранить тренажер',
    saveWorkout: 'Сохранить тренировку',
  },
} as const;
