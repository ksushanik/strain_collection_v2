# Media (питательные среды)

- **Назначение**: справочник питательных сред (название + состав/комментарии). Не хранит файлы.
- **Модель**: `Media` (id, name, composition?). Связь `StrainMedia` (strainId, mediaId, notes?).
- **API**:
  - `GET /media` с поиском/пагинацией (`search`, `page`, `limit`).
  - `GET /media/:id` — включает связанные штаммы (id, identifier).
  - `POST /media`, `PUT /media/:id`, `DELETE /media/:id` (нельзя удалить, если связана со штаммами).
  - Связка со штаммом: `POST /strains/:id/media { mediaId, notes? }`, `DELETE /strains/:id/media/:mediaId`.
- **Фронтенд**:
  - Страница `/media`: список, поиск, пагинация, add/edit/delete.
  - Карточка штамма: блок Media — показывает связанные среды (composition, notes), добавление/удаление линков.
- **Ограничения**: файлы/фото/видео не поддерживаются; для файлов потребуется отдельное хранилище.
