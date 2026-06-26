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
    delete: 'Удалить',
    resetSearch: 'Сбросить поиск',
    save: 'Сохранить',
  },
  alerts: {
    deleteMachineTitle: 'Удалить тренажер?',
    deleteMachineMessage: (name: string) =>
      `Тренажер «${name}» будет удален из списка.`,
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
  },
  accessibility: {
    addMachine: 'Добавить тренажер',
    back: 'Назад',
    deleteMachine: 'Удалить тренажер',
    editMachine: 'Редактировать тренажер',
    settings: 'Открыть настройки',
    search: 'Поиск',
    clearSearch: 'Очистить поиск',
    saveMachine: 'Сохранить тренажер',
  },
} as const;
