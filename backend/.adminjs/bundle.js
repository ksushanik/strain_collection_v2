(function (React, designSystem, adminjs) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  const Dashboard = () => {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: 'grey',
      p: 'xl'
    }, [/*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      key: 'header',
      mb: 'lg'
    }, 'Strain Collection Admin'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'text',
      mb: 'xl'
    }, 'Добро пожаловать в панель управления Strain Collection. Используйте меню слева для навигации по ресурсам.'), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: 'stats',
      display: 'flex',
      gap: 'lg'
    }, [/*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: 'strains',
      p: 'lg',
      bg: 'white',
      boxShadow: 'card',
      borderRadius: 'sm',
      flex: 1
    }, [/*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'strains-label',
      fontWeight: 'bold'
    }, 'Strains'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'strains-desc',
      fontSize: 'sm',
      mt: 'sm'
    }, 'Управление штаммами микроорганизмов'), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      key: 'strains-btn',
      mt: 'md',
      as: 'a',
      href: '/admin/resources/Strain'
    }, 'Перейти')]), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: 'samples',
      p: 'lg',
      bg: 'white',
      boxShadow: 'card',
      borderRadius: 'sm',
      flex: 1
    }, [/*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'samples-label',
      fontWeight: 'bold'
    }, 'Samples'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'samples-desc',
      fontSize: 'sm',
      mt: 'sm'
    }, 'Управление образцами и сборами'), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      key: 'samples-btn',
      mt: 'md',
      as: 'a',
      href: '/admin/resources/Sample'
    }, 'Перейти')]), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: 'storage',
      p: 'lg',
      bg: 'white',
      boxShadow: 'card',
      borderRadius: 'sm',
      flex: 1
    }, [/*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'storage-label',
      fontWeight: 'bold'
    }, 'Storage'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'storage-desc',
      fontSize: 'sm',
      mt: 'sm'
    }, 'Управление хранилищем и ячейками'), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      key: 'storage-btn',
      mt: 'md',
      as: 'a',
      href: '/admin/resources/StorageBox'
    }, 'Перейти')])])]);
  };

  const JsonShow = props => {
    const {
      record,
      property
    } = props;
    // AdminJS flattens objects in record.params, so 'changes.cols' might be there instead of 'changes' object.
    // But for 'mixed' or 'json' type, it should be available.
    // However, since we changed type to 'textarea' previously, let's revert to 'mixed' or handle it carefully.
    // Actually, let's try to get the raw value.

    let value = record?.params?.[property.path];

    // If value is missing, try to reconstruct from flattened params if it's an object
    if (!value && record?.params) {
      const prefix = `${property.path}.`;
      const obj = {};
      let hasKeys = false;
      Object.keys(record.params).forEach(key => {
        if (key.startsWith(prefix)) {
          obj[key.slice(prefix.length)] = record.params[key];
          hasKeys = true;
        }
      });
      if (hasKeys) value = obj;
    }
    if (!value) {
      return /*#__PURE__*/React__default.default.createElement('span', null, '-');
    }
    let displayValue = value;
    try {
      if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2);
      } else if (typeof value === 'string') {
        if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
          const parsed = JSON.parse(value);
          displayValue = JSON.stringify(parsed, null, 2);
        }
      }
    } catch {
      // ignore
    }
    const content = typeof displayValue === 'string' ? displayValue : JSON.stringify(displayValue, null, 2);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: 'xl'
    }, /*#__PURE__*/React__default.default.createElement('pre', {
      style: {
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: '#f4f6f8',
        padding: '10px',
        borderRadius: '4px'
      }
    }, content));
  };

  const api$1 = new adminjs.ApiClient();
  function RestoreBackup(props) {
    const {
      resource
    } = props;
    const addNotice = adminjs.useNotice();
    const [backupJson, setBackupJson] = React.useState('');
    const [restoring, setRestoring] = React.useState(false);
    const handleFile = async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      setBackupJson(text);
    };
    const handleSubmit = async () => {
      if (!backupJson.trim()) {
        addNotice({
          message: 'Выберите файл или вставьте JSON бэкапа',
          type: 'error'
        });
        return;
      }
      setRestoring(true);
      try {
        const response = await api$1.resourceAction({
          resourceId: resource.id,
          actionName: 'restore',
          method: 'post',
          data: {
            backupJson
          }
        });
        const notice = response.data?.notice;
        if (notice) addNotice(notice);
      } catch (error) {
        addNotice({
          message: error?.message || 'Restore failed',
          type: 'error'
        });
      } finally {
        setRestoring(false);
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "md"
    }, "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435: \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0441 JSON-\u0431\u044D\u043A\u0430\u043F\u043E\u043C \u0438\u043B\u0438 \u0432\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E. \u0414\u0430\u043D\u043D\u044B\u0435 \u0431\u0443\u0434\u0443\u0442 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0430\u043D\u044B."), /*#__PURE__*/React__default.default.createElement("label", {
      style: {
        display: 'inline-block',
        marginBottom: 12
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      as: "span",
      variant: "primary",
      size: "sm"
    }, "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u0430\u0439\u043B"), /*#__PURE__*/React__default.default.createElement("input", {
      type: "file",
      accept: "application/json",
      onChange: handleFile,
      style: {
        display: 'none'
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.TextArea, {
      width: "100%",
      minHeight: "320px",
      onChange: e => setBackupJson(e.target.value),
      value: backupJson,
      placeholder: '{ "samples": [...], "strains": [...] }'
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      mt: "lg",
      variant: "primary",
      onClick: handleSubmit,
      disabled: restoring
    }, restoring ? 'Восстановление...' : 'Восстановить'));
  }

  const api = new adminjs.ApiClient();
  function BackupDatabase(props) {
    const {
      resource
    } = props;
    const addNotice = adminjs.useNotice();
    const [backupJson, setBackupJson] = React.useState('');
    const [creating, setCreating] = React.useState(false);
    const handleCreate = async () => {
      setCreating(true);
      try {
        const response = await api.resourceAction({
          resourceId: resource.id,
          actionName: 'backup',
          method: 'post'
        });
        const notice = response.data?.notice;
        if (notice) addNotice(notice);
        const json = response.data?.backup;
        if (json) {
          setBackupJson(json);
        }
      } catch (error) {
        addNotice({
          message: error?.message || 'Не удалось создать бэкап',
          type: 'error'
        });
      } finally {
        setCreating(false);
      }
    };
    const handleDownload = () => {
      if (!backupJson) return;
      const blob = new Blob([backupJson], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().replace(/[:]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    const handleCopy = async () => {
      if (!backupJson) return;
      try {
        await navigator.clipboard.writeText(backupJson);
        addNotice({
          message: 'Бэкап скопирован в буфер обмена',
          type: 'success'
        });
      } catch {
        addNotice({
          message: 'Не удалось скопировать',
          type: 'error'
        });
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "md"
    }, "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0431\u044D\u043A\u0430\u043F \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u0435\u0433\u043E \u043A\u0430\u043A JSON (\u0441\u043A\u0430\u0447\u0430\u0439\u0442\u0435 \u0444\u0430\u0439\u043B \u0438\u043B\u0438 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435)."), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      size: "sm",
      onClick: handleCreate,
      disabled: creating,
      mr: "md"
    }, creating ? 'Создаём…' : 'Создать бэкап'), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "secondary",
      size: "sm",
      onClick: handleDownload,
      disabled: !backupJson,
      mr: "sm"
    }, "\u0421\u043A\u0430\u0447\u0430\u0442\u044C JSON"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "secondary",
      size: "sm",
      onClick: handleCopy,
      disabled: !backupJson
    }, "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C"), /*#__PURE__*/React__default.default.createElement(designSystem.TextArea, {
      mt: "lg",
      width: "100%",
      minHeight: "320px",
      onChange: e => setBackupJson(e.target.value),
      value: backupJson,
      placeholder: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u044D\u043A\u0430\u043F\u0430 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C",
      readOnly: true
    }));
  }

  const SUBJECTS = ['Strain', 'Sample', 'Storage', 'Media', 'Settings', 'Legend', 'Analytics', 'User', 'Group', 'AuditLog', 'Photo', 'all'];
  const ACTIONS = ['read', 'create', 'update', 'delete', 'manage'];
  const ensureArray = value => Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
  const PermissionsGrid = props => {
    const {
      onChange,
      property,
      record
    } = props;
    const value = React__default.default.useMemo(() => {
      const params = record?.params ?? {};
      // If AdminJS passes it as an object (rare but possible)
      if (params[property.path] && typeof params[property.path] === 'object') {
        return params[property.path];
      }

      // Unflatten logic for permissions.{Subject}.{Index}
      const result = {};
      Object.keys(params).forEach(key => {
        if (key.startsWith(`${property.path}.`)) {
          const parts = key.slice(property.path.length + 1).split('.');
          const subject = parts[0];
          if (SUBJECTS.includes(subject)) {
            if (!result[subject]) {
              result[subject] = [];
            }
            // The value is at this key
            result[subject]?.push(params[key]);
          }
        }
      });
      return result;
    }, [record, property.path]);
    const toggle = (subject, action) => {
      if (!onChange) return;
      const current = new Set(ensureArray(value[subject]));
      if (current.has(action)) {
        current.delete(action);
      } else {
        current.add(action);
      }
      const next = {
        ...value,
        [subject]: Array.from(current)
      };
      onChange(property.path, next);
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: 'grey'
    }, [/*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'title',
      mb: 'sm',
      fontWeight: 'bold'
    }, 'Права доступа'), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: 'grid',
      display: 'grid',
      gridTemplateColumns: '160px repeat(5, 1fr)',
      gridRowGap: 'md',
      gridColumnGap: 'md'
    }, [/*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: 'empty'
    }), ...ACTIONS.map(action => /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      key: action,
      style: {
        textAlign: 'center'
      }
    }, action)), ...SUBJECTS.flatMap(subject => [/*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: `${subject}-label`,
      display: 'flex',
      alignItems: 'center',
      gap: 'xs'
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: 'info'
    }, subject)), ...ACTIONS.map(action => {
      const checked = ensureArray(value[subject]).includes(action);
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        key: `${subject}-${action}`,
        display: 'flex',
        justifyContent: 'center'
      }, /*#__PURE__*/React__default.default.createElement(designSystem.CheckBox, {
        id: `${subject}-${action}`,
        checked,
        onChange: () => toggle(subject, action)
      }));
    })])]), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      key: 'hint',
      mt: 'md',
      fontSize: 12,
      color: 'grey60'
    }, 'Подсказка: используйте «all» + «manage» для полного доступа. При пустой карте будут использованы права роли/группы по умолчанию.')]);
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.JsonShow = JsonShow;
  AdminJS.UserComponents.RestoreBackup = RestoreBackup;
  AdminJS.UserComponents.BackupDatabase = BackupDatabase;
  AdminJS.UserComponents.PermissionsGrid = PermissionsGrid;

})(React, AdminJSDesignSystem, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9kYXNoYm9hcmQudHMiLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9qc29uLXNob3cudHMiLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXN0b3JlLWJhY2t1cC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9iYWNrdXAtZGF0YWJhc2UudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGVybWlzc2lvbnMtZ3JpZC50cyIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEJveCwgSDIsIFRleHQsIEJ1dHRvbiB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5cclxuY29uc3QgRGFzaGJvYXJkID0gKCkgPT4ge1xyXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KEJveCwgeyB2YXJpYW50OiAnZ3JleScsIHA6ICd4bCcgfSwgW1xyXG4gICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgSDIsXHJcbiAgICAgIHsga2V5OiAnaGVhZGVyJywgbWI6ICdsZycgfSxcclxuICAgICAgJ1N0cmFpbiBDb2xsZWN0aW9uIEFkbWluJyxcclxuICAgICksXHJcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICBUZXh0LFxyXG4gICAgICB7IGtleTogJ3RleHQnLCBtYjogJ3hsJyB9LFxyXG4gICAgICAn0JTQvtCx0YDQviDQv9C+0LbQsNC70L7QstCw0YLRjCDQsiDQv9Cw0L3QtdC70Ywg0YPQv9GA0LDQstC70LXQvdC40Y8gU3RyYWluIENvbGxlY3Rpb24uINCY0YHQv9C+0LvRjNC30YPQudGC0LUg0LzQtdC90Y4g0YHQu9C10LLQsCDQtNC70Y8g0L3QsNCy0LjQs9Cw0YbQuNC4INC/0L4g0YDQtdGB0YPRgNGB0LDQvC4nLFxyXG4gICAgKSxcclxuICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQm94LCB7IGtleTogJ3N0YXRzJywgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICdsZycgfSwgW1xyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgIEJveCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBrZXk6ICdzdHJhaW5zJyxcclxuICAgICAgICAgIHA6ICdsZycsXHJcbiAgICAgICAgICBiZzogJ3doaXRlJyxcclxuICAgICAgICAgIGJveFNoYWRvdzogJ2NhcmQnLFxyXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAnc20nLFxyXG4gICAgICAgICAgZmxleDogMSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgIFRleHQsXHJcbiAgICAgICAgICAgIHsga2V5OiAnc3RyYWlucy1sYWJlbCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9LFxyXG4gICAgICAgICAgICAnU3RyYWlucycsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgVGV4dCxcclxuICAgICAgICAgICAgeyBrZXk6ICdzdHJhaW5zLWRlc2MnLCBmb250U2l6ZTogJ3NtJywgbXQ6ICdzbScgfSxcclxuICAgICAgICAgICAgJ9Cj0L/RgNCw0LLQu9C10L3QuNC1INGI0YLQsNC80LzQsNC80Lgg0LzQuNC60YDQvtC+0YDQs9Cw0L3QuNC30LzQvtCyJyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBCdXR0b24sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBrZXk6ICdzdHJhaW5zLWJ0bicsXHJcbiAgICAgICAgICAgICAgbXQ6ICdtZCcsXHJcbiAgICAgICAgICAgICAgYXM6ICdhJyxcclxuICAgICAgICAgICAgICBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TdHJhaW4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAn0J/QtdGA0LXQudGC0LgnLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICBdLFxyXG4gICAgICApLFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgIEJveCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBrZXk6ICdzYW1wbGVzJyxcclxuICAgICAgICAgIHA6ICdsZycsXHJcbiAgICAgICAgICBiZzogJ3doaXRlJyxcclxuICAgICAgICAgIGJveFNoYWRvdzogJ2NhcmQnLFxyXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAnc20nLFxyXG4gICAgICAgICAgZmxleDogMSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgIFRleHQsXHJcbiAgICAgICAgICAgIHsga2V5OiAnc2FtcGxlcy1sYWJlbCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9LFxyXG4gICAgICAgICAgICAnU2FtcGxlcycsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgVGV4dCxcclxuICAgICAgICAgICAgeyBrZXk6ICdzYW1wbGVzLWRlc2MnLCBmb250U2l6ZTogJ3NtJywgbXQ6ICdzbScgfSxcclxuICAgICAgICAgICAgJ9Cj0L/RgNCw0LLQu9C10L3QuNC1INC+0LHRgNCw0LfRhtCw0LzQuCDQuCDRgdCx0L7RgNCw0LzQuCcsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgQnV0dG9uLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAga2V5OiAnc2FtcGxlcy1idG4nLFxyXG4gICAgICAgICAgICAgIG10OiAnbWQnLFxyXG4gICAgICAgICAgICAgIGFzOiAnYScsXHJcbiAgICAgICAgICAgICAgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvU2FtcGxlJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ9Cf0LXRgNC10LnRgtC4JyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgXSxcclxuICAgICAgKSxcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICBCb3gsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAga2V5OiAnc3RvcmFnZScsXHJcbiAgICAgICAgICBwOiAnbGcnLFxyXG4gICAgICAgICAgYmc6ICd3aGl0ZScsXHJcbiAgICAgICAgICBib3hTaGFkb3c6ICdjYXJkJyxcclxuICAgICAgICAgIGJvcmRlclJhZGl1czogJ3NtJyxcclxuICAgICAgICAgIGZsZXg6IDEsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBUZXh0LFxyXG4gICAgICAgICAgICB7IGtleTogJ3N0b3JhZ2UtbGFiZWwnLCBmb250V2VpZ2h0OiAnYm9sZCcgfSxcclxuICAgICAgICAgICAgJ1N0b3JhZ2UnLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgIFRleHQsXHJcbiAgICAgICAgICAgIHsga2V5OiAnc3RvcmFnZS1kZXNjJywgZm9udFNpemU6ICdzbScsIG10OiAnc20nIH0sXHJcbiAgICAgICAgICAgICfQo9C/0YDQsNCy0LvQtdC90LjQtSDRhdGA0LDQvdC40LvQuNGJ0LXQvCDQuCDRj9GH0LXQudC60LDQvNC4JyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBCdXR0b24sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBrZXk6ICdzdG9yYWdlLWJ0bicsXHJcbiAgICAgICAgICAgICAgbXQ6ICdtZCcsXHJcbiAgICAgICAgICAgICAgYXM6ICdhJyxcclxuICAgICAgICAgICAgICBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TdG9yYWdlQm94JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ9Cf0LXRgNC10LnRgtC4JyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgXSxcclxuICAgICAgKSxcclxuICAgIF0pLFxyXG4gIF0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGFzaGJvYXJkO1xyXG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcclxuaW1wb3J0IHsgQmFzZVByb3BlcnR5UHJvcHMgfSBmcm9tICdhZG1pbmpzJztcclxuXHJcbmNvbnN0IEpzb25TaG93ID0gKHByb3BzOiBCYXNlUHJvcGVydHlQcm9wcykgPT4ge1xyXG4gIGNvbnN0IHsgcmVjb3JkLCBwcm9wZXJ0eSB9ID0gcHJvcHM7XHJcbiAgLy8gQWRtaW5KUyBmbGF0dGVucyBvYmplY3RzIGluIHJlY29yZC5wYXJhbXMsIHNvICdjaGFuZ2VzLmNvbHMnIG1pZ2h0IGJlIHRoZXJlIGluc3RlYWQgb2YgJ2NoYW5nZXMnIG9iamVjdC5cclxuICAvLyBCdXQgZm9yICdtaXhlZCcgb3IgJ2pzb24nIHR5cGUsIGl0IHNob3VsZCBiZSBhdmFpbGFibGUuXHJcbiAgLy8gSG93ZXZlciwgc2luY2Ugd2UgY2hhbmdlZCB0eXBlIHRvICd0ZXh0YXJlYScgcHJldmlvdXNseSwgbGV0J3MgcmV2ZXJ0IHRvICdtaXhlZCcgb3IgaGFuZGxlIGl0IGNhcmVmdWxseS5cclxuICAvLyBBY3R1YWxseSwgbGV0J3MgdHJ5IHRvIGdldCB0aGUgcmF3IHZhbHVlLlxyXG5cclxuICBsZXQgdmFsdWUgPSByZWNvcmQ/LnBhcmFtcz8uW3Byb3BlcnR5LnBhdGhdO1xyXG5cclxuICAvLyBJZiB2YWx1ZSBpcyBtaXNzaW5nLCB0cnkgdG8gcmVjb25zdHJ1Y3QgZnJvbSBmbGF0dGVuZWQgcGFyYW1zIGlmIGl0J3MgYW4gb2JqZWN0XHJcbiAgaWYgKCF2YWx1ZSAmJiByZWNvcmQ/LnBhcmFtcykge1xyXG4gICAgY29uc3QgcHJlZml4ID0gYCR7cHJvcGVydHkucGF0aH0uYDtcclxuICAgIGNvbnN0IG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcclxuICAgIGxldCBoYXNLZXlzID0gZmFsc2U7XHJcbiAgICBPYmplY3Qua2V5cyhyZWNvcmQucGFyYW1zKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgaWYgKGtleS5zdGFydHNXaXRoKHByZWZpeCkpIHtcclxuICAgICAgICBvYmpba2V5LnNsaWNlKHByZWZpeC5sZW5ndGgpXSA9IHJlY29yZC5wYXJhbXNba2V5XTtcclxuICAgICAgICBoYXNLZXlzID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAoaGFzS2V5cykgdmFsdWUgPSBvYmo7XHJcbiAgfVxyXG5cclxuICBpZiAoIXZhbHVlKSB7XHJcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIG51bGwsICctJyk7XHJcbiAgfVxyXG5cclxuICBsZXQgZGlzcGxheVZhbHVlID0gdmFsdWU7XHJcbiAgdHJ5IHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGRpc3BsYXlWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICBpZiAodmFsdWUudHJpbSgpLnN0YXJ0c1dpdGgoJ3snKSB8fCB2YWx1ZS50cmltKCkuc3RhcnRzV2l0aCgnWycpKSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh2YWx1ZSk7XHJcbiAgICAgICAgZGlzcGxheVZhbHVlID0gSlNPTi5zdHJpbmdpZnkocGFyc2VkLCBudWxsLCAyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gaWdub3JlXHJcbiAgfVxyXG5cclxuICBjb25zdCBjb250ZW50ID1cclxuICAgIHR5cGVvZiBkaXNwbGF5VmFsdWUgPT09ICdzdHJpbmcnXHJcbiAgICAgID8gZGlzcGxheVZhbHVlXHJcbiAgICAgIDogSlNPTi5zdHJpbmdpZnkoZGlzcGxheVZhbHVlLCBudWxsLCAyKTtcclxuXHJcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICBCb3gsXHJcbiAgICB7IG1iOiAneGwnIH0sXHJcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAncHJlJyxcclxuICAgICAge1xyXG4gICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnLFxyXG4gICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgIGZvbnRGYW1pbHk6ICdtb25vc3BhY2UnLFxyXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y0ZjZmOCcsXHJcbiAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXHJcbiAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbnRlbnQsXHJcbiAgICApLFxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBKc29uU2hvdztcclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCBBY3Rpb25Qcm9wcywgTm90aWNlTWVzc2FnZSwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCwgVGV4dEFyZWEgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZXN0b3JlQmFja3VwKHByb3BzOiBBY3Rpb25Qcm9wcykge1xuICBjb25zdCB7IHJlc291cmNlIH0gPSBwcm9wcztcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG4gIGNvbnN0IFtiYWNrdXBKc29uLCBzZXRCYWNrdXBKc29uXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Jlc3RvcmluZywgc2V0UmVzdG9yaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCBoYW5kbGVGaWxlID0gYXN5bmMgKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgIHNldEJhY2t1cEpzb24odGV4dCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghYmFja3VwSnNvbi50cmltKCkpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICfQktGL0LHQtdGA0LjRgtC1INGE0LDQudC7INC40LvQuCDQstGB0YLQsNCy0YzRgtC1IEpTT04g0LHRjdC60LDQv9CwJywgdHlwZTogJ2Vycm9yJyB9IGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzZXRSZXN0b3JpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIGFjdGlvbk5hbWU6ICdyZXN0b3JlJyxcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIGRhdGE6IHsgYmFja3VwSnNvbiB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZS5kYXRhPy5ub3RpY2U7XG4gICAgICBpZiAobm90aWNlKSBhZGROb3RpY2Uobm90aWNlIGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yPy5tZXNzYWdlIHx8ICdSZXN0b3JlIGZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSBhcyBOb3RpY2VNZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0UmVzdG9yaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHZhcmlhbnQ9XCJncmV5XCI+XG4gICAgICA8VGV4dCBtYj1cIm1kXCI+XG4gICAgICAgINCS0L7RgdGB0YLQsNC90L7QstC70LXQvdC40LU6INCy0YvQsdC10YDQuNGC0LUg0YTQsNC50Lsg0YEgSlNPTi3QsdGN0LrQsNC/0L7QvCDQuNC70Lgg0LLRgdGC0LDQstGM0YLQtSDRgdC+0LTQtdGA0LbQuNC80L7QtSDQstGA0YPRh9C90YPRji4g0JTQsNC90L3Ri9C1INCx0YPQtNGD0YIg0L/QtdGA0LXQt9Cw0L/QuNGB0LDQvdGLLlxuICAgICAgPC9UZXh0PlxuICAgICAgPGxhYmVsIHN0eWxlPXt7IGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBtYXJnaW5Cb3R0b206IDEyIH19PlxuICAgICAgICA8QnV0dG9uIGFzPVwic3BhblwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgc2l6ZT1cInNtXCI+XG4gICAgICAgICAg0JLRi9Cx0YDQsNGC0Ywg0YTQsNC50LtcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICBhY2NlcHQ9XCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlRmlsZX1cbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbGFiZWw+XG4gICAgICA8VGV4dEFyZWFcbiAgICAgICAgd2lkdGg9XCIxMDAlXCJcbiAgICAgICAgbWluSGVpZ2h0PVwiMzIwcHhcIlxuICAgICAgICBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0QmFja3VwSnNvbihlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgIHZhbHVlPXtiYWNrdXBKc29ufVxuICAgICAgICBwbGFjZWhvbGRlcj17J3sgXCJzYW1wbGVzXCI6IFsuLi5dLCBcInN0cmFpbnNcIjogWy4uLl0gfSd9XG4gICAgICAvPlxuICAgICAgPEJ1dHRvbiBtdD1cImxnXCIgdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXtoYW5kbGVTdWJtaXR9IGRpc2FibGVkPXtyZXN0b3Jpbmd9PlxuICAgICAgICB7cmVzdG9yaW5nID8gJ9CS0L7RgdGB0YLQsNC90L7QstC70LXQvdC40LUuLi4nIDogJ9CS0L7RgdGB0YLQsNC90L7QstC40YLRjCd9XG4gICAgICA8L0J1dHRvbj5cbiAgICA8L0JveD5cbiAgKTtcbn1cclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCBBY3Rpb25Qcm9wcywgTm90aWNlTWVzc2FnZSwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCwgVGV4dEFyZWEgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCYWNrdXBEYXRhYmFzZShwcm9wczogQWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgeyByZXNvdXJjZSB9ID0gcHJvcHM7XG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuICBjb25zdCBbYmFja3VwSnNvbiwgc2V0QmFja3VwSnNvbl0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtjcmVhdGluZywgc2V0Q3JlYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IGhhbmRsZUNyZWF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRDcmVhdGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVzb3VyY2VBY3Rpb24oe1xuICAgICAgICByZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcbiAgICAgICAgYWN0aW9uTmFtZTogJ2JhY2t1cCcsXG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZS5kYXRhPy5ub3RpY2U7XG4gICAgICBpZiAobm90aWNlKSBhZGROb3RpY2Uobm90aWNlIGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgICAgY29uc3QganNvbiA9IChyZXNwb25zZS5kYXRhIGFzIGFueSk/LmJhY2t1cCBhcyBzdHJpbmc7XG4gICAgICBpZiAoanNvbikge1xuICAgICAgICBzZXRCYWNrdXBKc29uKGpzb24pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgIG1lc3NhZ2U6IGVycm9yPy5tZXNzYWdlIHx8ICfQndC1INGD0LTQsNC70L7RgdGMINGB0L7Qt9C00LDRgtGMINCx0Y3QutCw0L8nLFxuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgfSBhcyBOb3RpY2VNZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0Q3JlYXRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVEb3dubG9hZCA9ICgpID0+IHtcbiAgICBpZiAoIWJhY2t1cEpzb24pIHJldHVybjtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2JhY2t1cEpzb25dLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gdXJsO1xuICAgIGEuZG93bmxvYWQgPSBgYmFja3VwLSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6XS9nLCAnLScpfS5qc29uYDtcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUNvcHkgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFiYWNrdXBKc29uKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGJhY2t1cEpzb24pO1xuICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgbWVzc2FnZTogJ9CR0Y3QutCw0L8g0YHQutC+0L/QuNGA0L7QstCw0L0g0LIg0LHRg9GE0LXRgCDQvtCx0LzQtdC90LAnLFxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICB9IGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgbWVzc2FnZTogJ9Cd0LUg0YPQtNCw0LvQvtGB0Ywg0YHQutC+0L/QuNGA0L7QstCw0YLRjCcsXG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICB9IGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxCb3ggdmFyaWFudD1cImdyZXlcIj5cbiAgICAgIDxUZXh0IG1iPVwibWRcIj5cbiAgICAgICAg0KHQvtC30LTQsNC50YLQtSDQsdGN0LrQsNC/INC4INGB0L7RhdGA0LDQvdC40YLQtSDQtdCz0L4g0LrQsNC6IEpTT04gKNGB0LrQsNGH0LDQudGC0LUg0YTQsNC50Lsg0LjQu9C4INGB0LrQvtC/0LjRgNGD0LnRgtC1INGB0L7QtNC10YDQttC40LzQvtC1KS5cbiAgICAgIDwvVGV4dD5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cInByaW1hcnlcIlxuICAgICAgICBzaXplPVwic21cIlxuICAgICAgICBvbkNsaWNrPXtoYW5kbGVDcmVhdGV9XG4gICAgICAgIGRpc2FibGVkPXtjcmVhdGluZ31cbiAgICAgICAgbXI9XCJtZFwiXG4gICAgICA+XG4gICAgICAgIHtjcmVhdGluZyA/ICfQodC+0LfQtNCw0ZHQvOKApicgOiAn0KHQvtC30LTQsNGC0Ywg0LHRjdC60LDQvyd9XG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cInNlY29uZGFyeVwiXG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIG9uQ2xpY2s9e2hhbmRsZURvd25sb2FkfVxuICAgICAgICBkaXNhYmxlZD17IWJhY2t1cEpzb259XG4gICAgICAgIG1yPVwic21cIlxuICAgICAgPlxuICAgICAgICDQodC60LDRh9Cw0YLRjCBKU09OXG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cInNlY29uZGFyeVwiXG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNvcHl9XG4gICAgICAgIGRpc2FibGVkPXshYmFja3VwSnNvbn1cbiAgICAgID5cbiAgICAgICAg0JrQvtC/0LjRgNC+0LLQsNGC0YxcbiAgICAgIDwvQnV0dG9uPlxuXG4gICAgICA8VGV4dEFyZWFcbiAgICAgICAgbXQ9XCJsZ1wiXG4gICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAgIG1pbkhlaWdodD1cIjMyMHB4XCJcbiAgICAgICAgb25DaGFuZ2U9eyhlOiBhbnkpID0+IHNldEJhY2t1cEpzb24oZS50YXJnZXQudmFsdWUpfVxuICAgICAgICB2YWx1ZT17YmFja3VwSnNvbn1cbiAgICAgICAgcGxhY2Vob2xkZXI9XCLQoNC10LfRg9C70YzRgtCw0YIg0LHRjdC60LDQv9CwINC/0L7Rj9Cy0LjRgtGB0Y8g0LfQtNC10YHRjFwiXG4gICAgICAgIHJlYWRPbmx5XG4gICAgICAvPlxuICAgIDwvQm94PlxuICApO1xufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgQm94LCBMYWJlbCwgQ2hlY2tCb3gsIFRleHQsIEJhZGdlIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XHJcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eVByb3BzIH0gZnJvbSAnYWRtaW5qcyc7XHJcblxyXG5jb25zdCBTVUJKRUNUUyA9IFtcclxuICAnU3RyYWluJyxcclxuICAnU2FtcGxlJyxcclxuICAnU3RvcmFnZScsXHJcbiAgJ01lZGlhJyxcclxuICAnU2V0dGluZ3MnLFxyXG4gICdMZWdlbmQnLFxyXG4gICdBbmFseXRpY3MnLFxyXG4gICdVc2VyJyxcclxuICAnR3JvdXAnLFxyXG4gICdBdWRpdExvZycsXHJcbiAgJ1Bob3RvJyxcclxuICAnYWxsJyxcclxuXSBhcyBjb25zdDtcclxuXHJcbmNvbnN0IEFDVElPTlMgPSBbJ3JlYWQnLCAnY3JlYXRlJywgJ3VwZGF0ZScsICdkZWxldGUnLCAnbWFuYWdlJ10gYXMgY29uc3Q7XHJcblxyXG50eXBlIFBlcm1pc3Npb25zTWFwID0gUGFydGlhbDxSZWNvcmQ8KHR5cGVvZiBTVUJKRUNUUylbbnVtYmVyXSwgc3RyaW5nW10+PjtcclxuXHJcbmNvbnN0IGVuc3VyZUFycmF5ID0gKHZhbHVlOiB1bmtub3duKTogc3RyaW5nW10gPT5cclxuICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLmZpbHRlcigodikgPT4gdHlwZW9mIHYgPT09ICdzdHJpbmcnKSA6IFtdO1xyXG5cclxuY29uc3QgUGVybWlzc2lvbnNHcmlkID0gKHByb3BzOiBCYXNlUHJvcGVydHlQcm9wcykgPT4ge1xyXG4gIGNvbnN0IHsgb25DaGFuZ2UsIHByb3BlcnR5LCByZWNvcmQgfSA9IHByb3BzO1xyXG5cclxuICBjb25zdCB2YWx1ZTogUGVybWlzc2lvbnNNYXAgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zID8/IHt9O1xyXG4gICAgLy8gSWYgQWRtaW5KUyBwYXNzZXMgaXQgYXMgYW4gb2JqZWN0IChyYXJlIGJ1dCBwb3NzaWJsZSlcclxuICAgIGlmIChwYXJhbXNbcHJvcGVydHkucGF0aF0gJiYgdHlwZW9mIHBhcmFtc1twcm9wZXJ0eS5wYXRoXSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgcmV0dXJuIHBhcmFtc1twcm9wZXJ0eS5wYXRoXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVbmZsYXR0ZW4gbG9naWMgZm9yIHBlcm1pc3Npb25zLntTdWJqZWN0fS57SW5kZXh9XHJcbiAgICBjb25zdCByZXN1bHQ6IFBlcm1pc3Npb25zTWFwID0ge307XHJcbiAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoYCR7cHJvcGVydHkucGF0aH0uYCkpIHtcclxuICAgICAgICBjb25zdCBwYXJ0cyA9IGtleS5zbGljZShwcm9wZXJ0eS5wYXRoLmxlbmd0aCArIDEpLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgY29uc3Qgc3ViamVjdCA9IHBhcnRzWzBdIGFzICh0eXBlb2YgU1VCSkVDVFMpW251bWJlcl07XHJcbiAgICAgICAgaWYgKFNVQkpFQ1RTLmluY2x1ZGVzKHN1YmplY3QpKSB7XHJcbiAgICAgICAgICBpZiAoIXJlc3VsdFtzdWJqZWN0XSkge1xyXG4gICAgICAgICAgICByZXN1bHRbc3ViamVjdF0gPSBbXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIFRoZSB2YWx1ZSBpcyBhdCB0aGlzIGtleVxyXG4gICAgICAgICAgcmVzdWx0W3N1YmplY3RdPy5wdXNoKHBhcmFtc1trZXldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LCBbcmVjb3JkLCBwcm9wZXJ0eS5wYXRoXSk7XHJcblxyXG4gIGNvbnN0IHRvZ2dsZSA9IChzdWJqZWN0OiAodHlwZW9mIFNVQkpFQ1RTKVtudW1iZXJdLCBhY3Rpb246IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFvbkNoYW5nZSkgcmV0dXJuO1xyXG4gICAgY29uc3QgY3VycmVudCA9IG5ldyBTZXQoZW5zdXJlQXJyYXkodmFsdWVbc3ViamVjdF0pKTtcclxuICAgIGlmIChjdXJyZW50LmhhcyhhY3Rpb24pKSB7XHJcbiAgICAgIGN1cnJlbnQuZGVsZXRlKGFjdGlvbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjdXJyZW50LmFkZChhY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbmV4dCA9IHsgLi4udmFsdWUsIFtzdWJqZWN0XTogQXJyYXkuZnJvbShjdXJyZW50KSB9O1xyXG4gICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dCk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQm94LCB7IHZhcmlhbnQ6ICdncmV5JyB9LCBbXHJcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICBUZXh0LFxyXG4gICAgICB7IGtleTogJ3RpdGxlJywgbWI6ICdzbScsIGZvbnRXZWlnaHQ6ICdib2xkJyB9LFxyXG4gICAgICAn0J/RgNCw0LLQsCDQtNC+0YHRgtGD0L/QsCcsXHJcbiAgICApLFxyXG4gICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgQm94LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnZ3JpZCcsXHJcbiAgICAgICAgZGlzcGxheTogJ2dyaWQnLFxyXG4gICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICcxNjBweCByZXBlYXQoNSwgMWZyKScsXHJcbiAgICAgICAgZ3JpZFJvd0dhcDogJ21kJyxcclxuICAgICAgICBncmlkQ29sdW1uR2FwOiAnbWQnLFxyXG4gICAgICB9LFxyXG4gICAgICBbXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChCb3gsIHsga2V5OiAnZW1wdHknIH0pLFxyXG4gICAgICAgIC4uLkFDVElPTlMubWFwKChhY3Rpb24pID0+XHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBMYWJlbCxcclxuICAgICAgICAgICAgeyBrZXk6IGFjdGlvbiwgc3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0sXHJcbiAgICAgICAgICAgIGFjdGlvbixcclxuICAgICAgICAgICksXHJcbiAgICAgICAgKSxcclxuICAgICAgICAuLi5TVUJKRUNUUy5mbGF0TWFwKChzdWJqZWN0KSA9PiBbXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBCb3gsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBrZXk6IGAke3N1YmplY3R9LWxhYmVsYCxcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgZ2FwOiAneHMnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEJhZGdlLCB7IHZhcmlhbnQ6ICdpbmZvJyB9LCBzdWJqZWN0KSxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgICAuLi5BQ1RJT05TLm1hcCgoYWN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBlbnN1cmVBcnJheSh2YWx1ZVtzdWJqZWN0XSkuaW5jbHVkZXMoYWN0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgQm94LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleTogYCR7c3ViamVjdH0tJHthY3Rpb259YCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2hlY2tCb3gsIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtzdWJqZWN0fS0ke2FjdGlvbn1gLFxyXG4gICAgICAgICAgICAgICAgY2hlY2tlZCxcclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiAoKSA9PiB0b2dnbGUoc3ViamVjdCwgYWN0aW9uKSxcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgIF0pLFxyXG4gICAgICBdLFxyXG4gICAgKSxcclxuICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgIFRleHQsXHJcbiAgICAgIHsga2V5OiAnaGludCcsIG10OiAnbWQnLCBmb250U2l6ZTogMTIsIGNvbG9yOiAnZ3JleTYwJyB9LFxyXG4gICAgICAn0J/QvtC00YHQutCw0LfQutCwOiDQuNGB0L/QvtC70YzQt9GD0LnRgtC1IMKrYWxswrsgKyDCq21hbmFnZcK7INC00LvRjyDQv9C+0LvQvdC+0LPQviDQtNC+0YHRgtGD0L/QsC4g0J/RgNC4INC/0YPRgdGC0L7QuSDQutCw0YDRgtC1INCx0YPQtNGD0YIg0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdGLINC/0YDQsNCy0LAg0YDQvtC70Lgv0LPRgNGD0L/Qv9GLINC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOLicsXHJcbiAgICApLFxyXG4gIF0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGVybWlzc2lvbnNHcmlkO1xyXG4iLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBEYXNoYm9hcmQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvZGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmRcbmltcG9ydCBKc29uU2hvdyBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9qc29uLXNob3cnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkpzb25TaG93ID0gSnNvblNob3dcbmltcG9ydCBSZXN0b3JlQmFja3VwIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3Jlc3RvcmUtYmFja3VwJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SZXN0b3JlQmFja3VwID0gUmVzdG9yZUJhY2t1cFxuaW1wb3J0IEJhY2t1cERhdGFiYXNlIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2JhY2t1cC1kYXRhYmFzZSdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQmFja3VwRGF0YWJhc2UgPSBCYWNrdXBEYXRhYmFzZVxuaW1wb3J0IFBlcm1pc3Npb25zR3JpZCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9wZXJtaXNzaW9ucy1ncmlkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QZXJtaXNzaW9uc0dyaWQgPSBQZXJtaXNzaW9uc0dyaWQiXSwibmFtZXMiOlsiRGFzaGJvYXJkIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiQm94IiwidmFyaWFudCIsInAiLCJIMiIsImtleSIsIm1iIiwiVGV4dCIsImRpc3BsYXkiLCJnYXAiLCJiZyIsImJveFNoYWRvdyIsImJvcmRlclJhZGl1cyIsImZsZXgiLCJmb250V2VpZ2h0IiwiZm9udFNpemUiLCJtdCIsIkJ1dHRvbiIsImFzIiwiaHJlZiIsIkpzb25TaG93IiwicHJvcHMiLCJyZWNvcmQiLCJwcm9wZXJ0eSIsInZhbHVlIiwicGFyYW1zIiwicGF0aCIsInByZWZpeCIsIm9iaiIsImhhc0tleXMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInN0YXJ0c1dpdGgiLCJzbGljZSIsImxlbmd0aCIsImRpc3BsYXlWYWx1ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIiwicGFyc2VkIiwicGFyc2UiLCJjb250ZW50Iiwic3R5bGUiLCJ3aGl0ZVNwYWNlIiwiZm9udEZhbWlseSIsImJhY2tncm91bmRDb2xvciIsInBhZGRpbmciLCJhcGkiLCJBcGlDbGllbnQiLCJSZXN0b3JlQmFja3VwIiwicmVzb3VyY2UiLCJhZGROb3RpY2UiLCJ1c2VOb3RpY2UiLCJiYWNrdXBKc29uIiwic2V0QmFja3VwSnNvbiIsInVzZVN0YXRlIiwicmVzdG9yaW5nIiwic2V0UmVzdG9yaW5nIiwiaGFuZGxlRmlsZSIsImUiLCJmaWxlIiwidGFyZ2V0IiwiZmlsZXMiLCJ0ZXh0IiwiaGFuZGxlU3VibWl0IiwibWVzc2FnZSIsInR5cGUiLCJyZXNwb25zZSIsInJlc291cmNlQWN0aW9uIiwicmVzb3VyY2VJZCIsImlkIiwiYWN0aW9uTmFtZSIsIm1ldGhvZCIsImRhdGEiLCJub3RpY2UiLCJlcnJvciIsIm1hcmdpbkJvdHRvbSIsInNpemUiLCJhY2NlcHQiLCJvbkNoYW5nZSIsIlRleHRBcmVhIiwid2lkdGgiLCJtaW5IZWlnaHQiLCJwbGFjZWhvbGRlciIsIm9uQ2xpY2siLCJkaXNhYmxlZCIsIkJhY2t1cERhdGFiYXNlIiwiY3JlYXRpbmciLCJzZXRDcmVhdGluZyIsImhhbmRsZUNyZWF0ZSIsImpzb24iLCJiYWNrdXAiLCJoYW5kbGVEb3dubG9hZCIsImJsb2IiLCJCbG9iIiwidXJsIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiYSIsImRvY3VtZW50IiwiZG93bmxvYWQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJyZXBsYWNlIiwiY2xpY2siLCJyZXZva2VPYmplY3RVUkwiLCJoYW5kbGVDb3B5IiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwibXIiLCJyZWFkT25seSIsIlNVQkpFQ1RTIiwiQUNUSU9OUyIsImVuc3VyZUFycmF5IiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyIiwidiIsIlBlcm1pc3Npb25zR3JpZCIsInVzZU1lbW8iLCJyZXN1bHQiLCJwYXJ0cyIsInNwbGl0Iiwic3ViamVjdCIsImluY2x1ZGVzIiwicHVzaCIsInRvZ2dsZSIsImFjdGlvbiIsImN1cnJlbnQiLCJTZXQiLCJoYXMiLCJkZWxldGUiLCJhZGQiLCJuZXh0IiwiZnJvbSIsImdyaWRUZW1wbGF0ZUNvbHVtbnMiLCJncmlkUm93R2FwIiwiZ3JpZENvbHVtbkdhcCIsIm1hcCIsIkxhYmVsIiwidGV4dEFsaWduIiwiZmxhdE1hcCIsImFsaWduSXRlbXMiLCJCYWRnZSIsImNoZWNrZWQiLCJqdXN0aWZ5Q29udGVudCIsIkNoZWNrQm94IiwiY29sb3IiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFHQSxNQUFNQSxTQUFTLEdBQUdBLE1BQU07RUFDdEIsRUFBQSxvQkFBT0Msc0JBQUssQ0FBQ0MsYUFBYSxDQUFDQyxnQkFBRyxFQUFFO0VBQUVDLElBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQUVDLElBQUFBLENBQUMsRUFBRTtFQUFLLEdBQUMsRUFBRSxjQUM1REosc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQkksZUFBRSxFQUNGO0VBQUVDLElBQUFBLEdBQUcsRUFBRSxRQUFRO0VBQUVDLElBQUFBLEVBQUUsRUFBRTtLQUFNLEVBQzNCLHlCQUNGLENBQUMsZUFDRFAsc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQk8saUJBQUksRUFDSjtFQUFFRixJQUFBQSxHQUFHLEVBQUUsTUFBTTtFQUFFQyxJQUFBQSxFQUFFLEVBQUU7S0FBTSxFQUN6QiwyR0FDRixDQUFDLGVBQ0RQLHNCQUFLLENBQUNDLGFBQWEsQ0FBQ0MsZ0JBQUcsRUFBRTtFQUFFSSxJQUFBQSxHQUFHLEVBQUUsT0FBTztFQUFFRyxJQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUFFQyxJQUFBQSxHQUFHLEVBQUU7RUFBSyxHQUFDLEVBQUUsY0FDckVWLHNCQUFLLENBQUNDLGFBQWEsQ0FDakJDLGdCQUFHLEVBQ0g7RUFDRUksSUFBQUEsR0FBRyxFQUFFLFNBQVM7RUFDZEYsSUFBQUEsQ0FBQyxFQUFFLElBQUk7RUFDUE8sSUFBQUEsRUFBRSxFQUFFLE9BQU87RUFDWEMsSUFBQUEsU0FBUyxFQUFFLE1BQU07RUFDakJDLElBQUFBLFlBQVksRUFBRSxJQUFJO0VBQ2xCQyxJQUFBQSxJQUFJLEVBQUU7RUFDUixHQUFDLEVBQ0QsY0FDRWQsc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQk8saUJBQUksRUFDSjtFQUFFRixJQUFBQSxHQUFHLEVBQUUsZUFBZTtFQUFFUyxJQUFBQSxVQUFVLEVBQUU7S0FBUSxFQUM1QyxTQUNGLENBQUMsZUFDRGYsc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQk8saUJBQUksRUFDSjtFQUFFRixJQUFBQSxHQUFHLEVBQUUsY0FBYztFQUFFVSxJQUFBQSxRQUFRLEVBQUUsSUFBSTtFQUFFQyxJQUFBQSxFQUFFLEVBQUU7S0FBTSxFQUNqRCxxQ0FDRixDQUFDLGVBQ0RqQixzQkFBSyxDQUFDQyxhQUFhLENBQ2pCaUIsbUJBQU0sRUFDTjtFQUNFWixJQUFBQSxHQUFHLEVBQUUsYUFBYTtFQUNsQlcsSUFBQUEsRUFBRSxFQUFFLElBQUk7RUFDUkUsSUFBQUEsRUFBRSxFQUFFLEdBQUc7RUFDUEMsSUFBQUEsSUFBSSxFQUFFO0tBQ1AsRUFDRCxTQUNGLENBQUMsQ0FFTCxDQUFDLGVBQ0RwQixzQkFBSyxDQUFDQyxhQUFhLENBQ2pCQyxnQkFBRyxFQUNIO0VBQ0VJLElBQUFBLEdBQUcsRUFBRSxTQUFTO0VBQ2RGLElBQUFBLENBQUMsRUFBRSxJQUFJO0VBQ1BPLElBQUFBLEVBQUUsRUFBRSxPQUFPO0VBQ1hDLElBQUFBLFNBQVMsRUFBRSxNQUFNO0VBQ2pCQyxJQUFBQSxZQUFZLEVBQUUsSUFBSTtFQUNsQkMsSUFBQUEsSUFBSSxFQUFFO0VBQ1IsR0FBQyxFQUNELGNBQ0VkLHNCQUFLLENBQUNDLGFBQWEsQ0FDakJPLGlCQUFJLEVBQ0o7RUFBRUYsSUFBQUEsR0FBRyxFQUFFLGVBQWU7RUFBRVMsSUFBQUEsVUFBVSxFQUFFO0tBQVEsRUFDNUMsU0FDRixDQUFDLGVBQ0RmLHNCQUFLLENBQUNDLGFBQWEsQ0FDakJPLGlCQUFJLEVBQ0o7RUFBRUYsSUFBQUEsR0FBRyxFQUFFLGNBQWM7RUFBRVUsSUFBQUEsUUFBUSxFQUFFLElBQUk7RUFBRUMsSUFBQUEsRUFBRSxFQUFFO0tBQU0sRUFDakQsZ0NBQ0YsQ0FBQyxlQUNEakIsc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQmlCLG1CQUFNLEVBQ047RUFDRVosSUFBQUEsR0FBRyxFQUFFLGFBQWE7RUFDbEJXLElBQUFBLEVBQUUsRUFBRSxJQUFJO0VBQ1JFLElBQUFBLEVBQUUsRUFBRSxHQUFHO0VBQ1BDLElBQUFBLElBQUksRUFBRTtLQUNQLEVBQ0QsU0FDRixDQUFDLENBRUwsQ0FBQyxlQUNEcEIsc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQkMsZ0JBQUcsRUFDSDtFQUNFSSxJQUFBQSxHQUFHLEVBQUUsU0FBUztFQUNkRixJQUFBQSxDQUFDLEVBQUUsSUFBSTtFQUNQTyxJQUFBQSxFQUFFLEVBQUUsT0FBTztFQUNYQyxJQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUNqQkMsSUFBQUEsWUFBWSxFQUFFLElBQUk7RUFDbEJDLElBQUFBLElBQUksRUFBRTtFQUNSLEdBQUMsRUFDRCxjQUNFZCxzQkFBSyxDQUFDQyxhQUFhLENBQ2pCTyxpQkFBSSxFQUNKO0VBQUVGLElBQUFBLEdBQUcsRUFBRSxlQUFlO0VBQUVTLElBQUFBLFVBQVUsRUFBRTtLQUFRLEVBQzVDLFNBQ0YsQ0FBQyxlQUNEZixzQkFBSyxDQUFDQyxhQUFhLENBQ2pCTyxpQkFBSSxFQUNKO0VBQUVGLElBQUFBLEdBQUcsRUFBRSxjQUFjO0VBQUVVLElBQUFBLFFBQVEsRUFBRSxJQUFJO0VBQUVDLElBQUFBLEVBQUUsRUFBRTtLQUFNLEVBQ2pELGtDQUNGLENBQUMsZUFDRGpCLHNCQUFLLENBQUNDLGFBQWEsQ0FDakJpQixtQkFBTSxFQUNOO0VBQ0VaLElBQUFBLEdBQUcsRUFBRSxhQUFhO0VBQ2xCVyxJQUFBQSxFQUFFLEVBQUUsSUFBSTtFQUNSRSxJQUFBQSxFQUFFLEVBQUUsR0FBRztFQUNQQyxJQUFBQSxJQUFJLEVBQUU7S0FDUCxFQUNELFNBQ0YsQ0FBQyxDQUVMLENBQUMsQ0FDRixDQUFDLENBQ0gsQ0FBQztFQUNKLENBQUM7O0VDakhELE1BQU1DLFFBQVEsR0FBSUMsS0FBd0IsSUFBSztJQUM3QyxNQUFNO01BQUVDLE1BQU07RUFBRUMsSUFBQUE7RUFBUyxHQUFDLEdBQUdGLEtBQUs7RUFDbEM7RUFDQTtFQUNBO0VBQ0E7O0lBRUEsSUFBSUcsS0FBSyxHQUFHRixNQUFNLEVBQUVHLE1BQU0sR0FBR0YsUUFBUSxDQUFDRyxJQUFJLENBQUM7O0VBRTNDO0VBQ0EsRUFBQSxJQUFJLENBQUNGLEtBQUssSUFBSUYsTUFBTSxFQUFFRyxNQUFNLEVBQUU7RUFDNUIsSUFBQSxNQUFNRSxNQUFNLEdBQUcsQ0FBQSxFQUFHSixRQUFRLENBQUNHLElBQUksQ0FBQSxDQUFBLENBQUc7TUFDbEMsTUFBTUUsR0FBNEIsR0FBRyxFQUFFO01BQ3ZDLElBQUlDLE9BQU8sR0FBRyxLQUFLO01BQ25CQyxNQUFNLENBQUNDLElBQUksQ0FBQ1QsTUFBTSxDQUFDRyxNQUFNLENBQUMsQ0FBQ08sT0FBTyxDQUFFM0IsR0FBRyxJQUFLO0VBQzFDLE1BQUEsSUFBSUEsR0FBRyxDQUFDNEIsVUFBVSxDQUFDTixNQUFNLENBQUMsRUFBRTtFQUMxQkMsUUFBQUEsR0FBRyxDQUFDdkIsR0FBRyxDQUFDNkIsS0FBSyxDQUFDUCxNQUFNLENBQUNRLE1BQU0sQ0FBQyxDQUFDLEdBQUdiLE1BQU0sQ0FBQ0csTUFBTSxDQUFDcEIsR0FBRyxDQUFDO0VBQ2xEd0IsUUFBQUEsT0FBTyxHQUFHLElBQUk7RUFDaEIsTUFBQTtFQUNGLElBQUEsQ0FBQyxDQUFDO0VBQ0YsSUFBQSxJQUFJQSxPQUFPLEVBQUVMLEtBQUssR0FBR0ksR0FBRztFQUMxQixFQUFBO0lBRUEsSUFBSSxDQUFDSixLQUFLLEVBQUU7TUFDVixvQkFBT3pCLHNCQUFLLENBQUNDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztFQUMvQyxFQUFBO0lBRUEsSUFBSW9DLFlBQVksR0FBR1osS0FBSztJQUN4QixJQUFJO0VBQ0YsSUFBQSxJQUFJLE9BQU9BLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0JZLFlBQVksR0FBR0MsSUFBSSxDQUFDQyxTQUFTLENBQUNkLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0VBQy9DLElBQUEsQ0FBQyxNQUFNLElBQUksT0FBT0EsS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUNwQyxJQUFJQSxLQUFLLENBQUNlLElBQUksRUFBRSxDQUFDTixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUlULEtBQUssQ0FBQ2UsSUFBSSxFQUFFLENBQUNOLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUNoRSxRQUFBLE1BQU1PLE1BQU0sR0FBR0gsSUFBSSxDQUFDSSxLQUFLLENBQUNqQixLQUFLLENBQUM7VUFDaENZLFlBQVksR0FBR0MsSUFBSSxDQUFDQyxTQUFTLENBQUNFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0VBQ2hELE1BQUE7RUFDRixJQUFBO0VBQ0YsRUFBQSxDQUFDLENBQUMsTUFBTTtFQUNOO0VBQUEsRUFBQTtFQUdGLEVBQUEsTUFBTUUsT0FBTyxHQUNYLE9BQU9OLFlBQVksS0FBSyxRQUFRLEdBQzVCQSxZQUFZLEdBQ1pDLElBQUksQ0FBQ0MsU0FBUyxDQUFDRixZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztFQUUzQyxFQUFBLG9CQUFPckMsc0JBQUssQ0FBQ0MsYUFBYSxDQUN4QkMsZ0JBQUcsRUFDSDtFQUFFSyxJQUFBQSxFQUFFLEVBQUU7RUFBSyxHQUFDLGVBQ1pQLHNCQUFLLENBQUNDLGFBQWEsQ0FDakIsS0FBSyxFQUNMO0VBQ0UyQyxJQUFBQSxLQUFLLEVBQUU7RUFDTEMsTUFBQUEsVUFBVSxFQUFFLFVBQVU7RUFDdEI3QixNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUNoQjhCLE1BQUFBLFVBQVUsRUFBRSxXQUFXO0VBQ3ZCQyxNQUFBQSxlQUFlLEVBQUUsU0FBUztFQUMxQkMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZm5DLE1BQUFBLFlBQVksRUFBRTtFQUNoQjtLQUNELEVBQ0Q4QixPQUNGLENBQ0YsQ0FBQztFQUNILENBQUM7O0VDaEVELE1BQU1NLEtBQUcsR0FBRyxJQUFJQyxpQkFBUyxFQUFFO0VBRVosU0FBU0MsYUFBYUEsQ0FBQzdCLEtBQWtCLEVBQUU7SUFDeEQsTUFBTTtFQUFFOEIsSUFBQUE7RUFBUyxHQUFDLEdBQUc5QixLQUFLO0VBQzFCLEVBQUEsTUFBTStCLFNBQVMsR0FBR0MsaUJBQVMsRUFBRTtJQUM3QixNQUFNLENBQUNDLFVBQVUsRUFBRUMsYUFBYSxDQUFDLEdBQUdDLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDaEQsTUFBTSxDQUFDQyxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHRixjQUFRLENBQUMsS0FBSyxDQUFDO0VBRWpELEVBQUEsTUFBTUcsVUFBVSxHQUFHLE1BQU9DLENBQXNDLElBQUs7TUFDbkUsTUFBTUMsSUFBSSxHQUFHRCxDQUFDLENBQUNFLE1BQU0sQ0FBQ0MsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNoQyxJQUFJLENBQUNGLElBQUksRUFBRTtFQUNYLElBQUEsTUFBTUcsSUFBSSxHQUFHLE1BQU1ILElBQUksQ0FBQ0csSUFBSSxFQUFFO01BQzlCVCxhQUFhLENBQUNTLElBQUksQ0FBQztJQUNyQixDQUFDO0VBRUQsRUFBQSxNQUFNQyxZQUFZLEdBQUcsWUFBWTtFQUMvQixJQUFBLElBQUksQ0FBQ1gsVUFBVSxDQUFDZixJQUFJLEVBQUUsRUFBRTtFQUN0QmEsTUFBQUEsU0FBUyxDQUFDO0VBQUVjLFFBQUFBLE9BQU8sRUFBRSx3Q0FBd0M7RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQVEsT0FBa0IsQ0FBQztFQUNoRyxNQUFBO0VBQ0YsSUFBQTtNQUNBVCxZQUFZLENBQUMsSUFBSSxDQUFDO01BQ2xCLElBQUk7RUFDRixNQUFBLE1BQU1VLFFBQVEsR0FBRyxNQUFNcEIsS0FBRyxDQUFDcUIsY0FBYyxDQUFDO1VBQ3hDQyxVQUFVLEVBQUVuQixRQUFRLENBQUNvQixFQUFFO0VBQ3ZCQyxRQUFBQSxVQUFVLEVBQUUsU0FBUztFQUNyQkMsUUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZEMsUUFBQUEsSUFBSSxFQUFFO0VBQUVwQixVQUFBQTtFQUFXO0VBQ3JCLE9BQUMsQ0FBQztFQUNGLE1BQUEsTUFBTXFCLE1BQU0sR0FBR1AsUUFBUSxDQUFDTSxJQUFJLEVBQUVDLE1BQU07RUFDcEMsTUFBQSxJQUFJQSxNQUFNLEVBQUV2QixTQUFTLENBQUN1QixNQUF1QixDQUFDO01BQ2hELENBQUMsQ0FBQyxPQUFPQyxLQUFVLEVBQUU7RUFDbkJ4QixNQUFBQSxTQUFTLENBQUM7RUFBRWMsUUFBQUEsT0FBTyxFQUFFVSxLQUFLLEVBQUVWLE9BQU8sSUFBSSxnQkFBZ0I7RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQVEsT0FBa0IsQ0FBQztFQUM1RixJQUFBLENBQUMsU0FBUztRQUNSVCxZQUFZLENBQUMsS0FBSyxDQUFDO0VBQ3JCLElBQUE7SUFDRixDQUFDO0VBRUQsRUFBQSxvQkFDRTNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDQyxJQUFBQSxPQUFPLEVBQUM7RUFBTSxHQUFBLGVBQ2pCSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLGlCQUFJLEVBQUE7RUFBQ0QsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxFQUFDLG1oQkFFUixDQUFDLGVBQ1BQLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUE7RUFBTzJDLElBQUFBLEtBQUssRUFBRTtFQUFFbkMsTUFBQUEsT0FBTyxFQUFFLGNBQWM7RUFBRXFFLE1BQUFBLFlBQVksRUFBRTtFQUFHO0VBQUUsR0FBQSxlQUMxRDlFLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lCLG1CQUFNLEVBQUE7RUFBQ0MsSUFBQUEsRUFBRSxFQUFDLE1BQU07RUFBQ2hCLElBQUFBLE9BQU8sRUFBQyxTQUFTO0VBQUM0RSxJQUFBQSxJQUFJLEVBQUM7RUFBSSxHQUFBLEVBQUMscUVBRXRDLENBQUMsZUFDVC9FLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUE7RUFDRW1FLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQ1hZLElBQUFBLE1BQU0sRUFBQyxrQkFBa0I7RUFDekJDLElBQUFBLFFBQVEsRUFBRXJCLFVBQVc7RUFDckJoQixJQUFBQSxLQUFLLEVBQUU7RUFBRW5DLE1BQUFBLE9BQU8sRUFBRTtFQUFPO0VBQUUsR0FDNUIsQ0FDSSxDQUFDLGVBQ1JULHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lGLHFCQUFRLEVBQUE7RUFDUEMsSUFBQUEsS0FBSyxFQUFDLE1BQU07RUFDWkMsSUFBQUEsU0FBUyxFQUFDLE9BQU87TUFDakJILFFBQVEsRUFBR3BCLENBQU0sSUFBS0wsYUFBYSxDQUFDSyxDQUFDLENBQUNFLE1BQU0sQ0FBQ3RDLEtBQUssQ0FBRTtFQUNwREEsSUFBQUEsS0FBSyxFQUFFOEIsVUFBVztFQUNsQjhCLElBQUFBLFdBQVcsRUFBRTtFQUF5QyxHQUN2RCxDQUFDLGVBQ0ZyRixzQkFBQSxDQUFBQyxhQUFBLENBQUNpQixtQkFBTSxFQUFBO0VBQUNELElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNkLElBQUFBLE9BQU8sRUFBQyxTQUFTO0VBQUNtRixJQUFBQSxPQUFPLEVBQUVwQixZQUFhO0VBQUNxQixJQUFBQSxRQUFRLEVBQUU3QjtFQUFVLEdBQUEsRUFDMUVBLFNBQVMsR0FBRyxtQkFBbUIsR0FBRyxjQUM3QixDQUNMLENBQUM7RUFFVjs7RUNqRUEsTUFBTVQsR0FBRyxHQUFHLElBQUlDLGlCQUFTLEVBQUU7RUFFWixTQUFTc0MsY0FBY0EsQ0FBQ2xFLEtBQWtCLEVBQUU7SUFDekQsTUFBTTtFQUFFOEIsSUFBQUE7RUFBUyxHQUFDLEdBQUc5QixLQUFLO0VBQzFCLEVBQUEsTUFBTStCLFNBQVMsR0FBR0MsaUJBQVMsRUFBRTtJQUM3QixNQUFNLENBQUNDLFVBQVUsRUFBRUMsYUFBYSxDQUFDLEdBQUdDLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDaEQsTUFBTSxDQUFDZ0MsUUFBUSxFQUFFQyxXQUFXLENBQUMsR0FBR2pDLGNBQVEsQ0FBQyxLQUFLLENBQUM7RUFFL0MsRUFBQSxNQUFNa0MsWUFBWSxHQUFHLFlBQVk7TUFDL0JELFdBQVcsQ0FBQyxJQUFJLENBQUM7TUFDakIsSUFBSTtFQUNGLE1BQUEsTUFBTXJCLFFBQVEsR0FBRyxNQUFNcEIsR0FBRyxDQUFDcUIsY0FBYyxDQUFDO1VBQ3hDQyxVQUFVLEVBQUVuQixRQUFRLENBQUNvQixFQUFFO0VBQ3ZCQyxRQUFBQSxVQUFVLEVBQUUsUUFBUTtFQUNwQkMsUUFBQUEsTUFBTSxFQUFFO0VBQ1YsT0FBQyxDQUFDO0VBQ0YsTUFBQSxNQUFNRSxNQUFNLEdBQUdQLFFBQVEsQ0FBQ00sSUFBSSxFQUFFQyxNQUFNO0VBQ3BDLE1BQUEsSUFBSUEsTUFBTSxFQUFFdkIsU0FBUyxDQUFDdUIsTUFBdUIsQ0FBQztFQUM5QyxNQUFBLE1BQU1nQixJQUFJLEdBQUl2QixRQUFRLENBQUNNLElBQUksRUFBVWtCLE1BQWdCO0VBQ3JELE1BQUEsSUFBSUQsSUFBSSxFQUFFO1VBQ1JwQyxhQUFhLENBQUNvQyxJQUFJLENBQUM7RUFDckIsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPZixLQUFVLEVBQUU7RUFDbkJ4QixNQUFBQSxTQUFTLENBQUM7RUFDUmMsUUFBQUEsT0FBTyxFQUFFVSxLQUFLLEVBQUVWLE9BQU8sSUFBSSwwQkFBMEI7RUFDckRDLFFBQUFBLElBQUksRUFBRTtFQUNSLE9BQWtCLENBQUM7RUFDckIsSUFBQSxDQUFDLFNBQVM7UUFDUnNCLFdBQVcsQ0FBQyxLQUFLLENBQUM7RUFDcEIsSUFBQTtJQUNGLENBQUM7SUFFRCxNQUFNSSxjQUFjLEdBQUdBLE1BQU07TUFDM0IsSUFBSSxDQUFDdkMsVUFBVSxFQUFFO01BQ2pCLE1BQU13QyxJQUFJLEdBQUcsSUFBSUMsSUFBSSxDQUFDLENBQUN6QyxVQUFVLENBQUMsRUFBRTtFQUFFYSxNQUFBQSxJQUFJLEVBQUU7RUFBbUIsS0FBQyxDQUFDO0VBQ2pFLElBQUEsTUFBTTZCLEdBQUcsR0FBR0MsR0FBRyxDQUFDQyxlQUFlLENBQUNKLElBQUksQ0FBQztFQUNyQyxJQUFBLE1BQU1LLENBQUMsR0FBR0MsUUFBUSxDQUFDcEcsYUFBYSxDQUFDLEdBQUcsQ0FBQztNQUNyQ21HLENBQUMsQ0FBQ2hGLElBQUksR0FBRzZFLEdBQUc7RUFDWkcsSUFBQUEsQ0FBQyxDQUFDRSxRQUFRLEdBQUcsVUFBVSxJQUFJQyxJQUFJLEVBQUUsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUEsS0FBQSxDQUFPO01BQzNFTCxDQUFDLENBQUNNLEtBQUssRUFBRTtFQUNUUixJQUFBQSxHQUFHLENBQUNTLGVBQWUsQ0FBQ1YsR0FBRyxDQUFDO0lBQzFCLENBQUM7RUFFRCxFQUFBLE1BQU1XLFVBQVUsR0FBRyxZQUFZO01BQzdCLElBQUksQ0FBQ3JELFVBQVUsRUFBRTtNQUNqQixJQUFJO0VBQ0YsTUFBQSxNQUFNc0QsU0FBUyxDQUFDQyxTQUFTLENBQUNDLFNBQVMsQ0FBQ3hELFVBQVUsQ0FBQztFQUMvQ0YsTUFBQUEsU0FBUyxDQUFDO0VBQ1JjLFFBQUFBLE9BQU8sRUFBRSxpQ0FBaUM7RUFDMUNDLFFBQUFBLElBQUksRUFBRTtFQUNSLE9BQWtCLENBQUM7RUFDckIsSUFBQSxDQUFDLENBQUMsTUFBTTtFQUNOZixNQUFBQSxTQUFTLENBQUM7RUFDUmMsUUFBQUEsT0FBTyxFQUFFLHdCQUF3QjtFQUNqQ0MsUUFBQUEsSUFBSSxFQUFFO0VBQ1IsT0FBa0IsQ0FBQztFQUNyQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsb0JBQ0VwRSxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ0MsSUFBQUEsT0FBTyxFQUFDO0VBQU0sR0FBQSxlQUNqQkgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDTyxpQkFBSSxFQUFBO0VBQUNELElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsRUFBQyxvWkFFUixDQUFDLGVBQ1BQLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lCLG1CQUFNLEVBQUE7RUFDTGYsSUFBQUEsT0FBTyxFQUFDLFNBQVM7RUFDakI0RSxJQUFBQSxJQUFJLEVBQUMsSUFBSTtFQUNUTyxJQUFBQSxPQUFPLEVBQUVLLFlBQWE7RUFDdEJKLElBQUFBLFFBQVEsRUFBRUUsUUFBUztFQUNuQnVCLElBQUFBLEVBQUUsRUFBQztLQUFJLEVBRU52QixRQUFRLEdBQUcsVUFBVSxHQUFHLGVBQ25CLENBQUMsZUFDVHpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lCLG1CQUFNLEVBQUE7RUFDTGYsSUFBQUEsT0FBTyxFQUFDLFdBQVc7RUFDbkI0RSxJQUFBQSxJQUFJLEVBQUMsSUFBSTtFQUNUTyxJQUFBQSxPQUFPLEVBQUVRLGNBQWU7TUFDeEJQLFFBQVEsRUFBRSxDQUFDaEMsVUFBVztFQUN0QnlELElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsRUFDUixpREFFTyxDQUFDLGVBQ1RoSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQixtQkFBTSxFQUFBO0VBQ0xmLElBQUFBLE9BQU8sRUFBQyxXQUFXO0VBQ25CNEUsSUFBQUEsSUFBSSxFQUFDLElBQUk7RUFDVE8sSUFBQUEsT0FBTyxFQUFFc0IsVUFBVztFQUNwQnJCLElBQUFBLFFBQVEsRUFBRSxDQUFDaEM7RUFBVyxHQUFBLEVBQ3ZCLDhEQUVPLENBQUMsZUFFVHZELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lGLHFCQUFRLEVBQUE7RUFDUGpFLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQ1BrRSxJQUFBQSxLQUFLLEVBQUMsTUFBTTtFQUNaQyxJQUFBQSxTQUFTLEVBQUMsT0FBTztNQUNqQkgsUUFBUSxFQUFHcEIsQ0FBTSxJQUFLTCxhQUFhLENBQUNLLENBQUMsQ0FBQ0UsTUFBTSxDQUFDdEMsS0FBSyxDQUFFO0VBQ3BEQSxJQUFBQSxLQUFLLEVBQUU4QixVQUFXO0VBQ2xCOEIsSUFBQUEsV0FBVyxFQUFDLDZLQUFpQztNQUM3QzRCLFFBQVEsRUFBQTtFQUFBLEdBQ1QsQ0FDRSxDQUFDO0VBRVY7O0VDdEdBLE1BQU1DLFFBQVEsR0FBRyxDQUNmLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULE9BQU8sRUFDUCxVQUFVLEVBQ1YsUUFBUSxFQUNSLFdBQVcsRUFDWCxNQUFNLEVBQ04sT0FBTyxFQUNQLFVBQVUsRUFDVixPQUFPLEVBQ1AsS0FBSyxDQUNHO0VBRVYsTUFBTUMsT0FBTyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBVTtFQUl6RSxNQUFNQyxXQUFXLEdBQUkzRixLQUFjLElBQ2pDNEYsS0FBSyxDQUFDQyxPQUFPLENBQUM3RixLQUFLLENBQUMsR0FBR0EsS0FBSyxDQUFDOEYsTUFBTSxDQUFFQyxDQUFDLElBQUssT0FBT0EsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxHQUFHLEVBQUU7RUFFeEUsTUFBTUMsZUFBZSxHQUFJbkcsS0FBd0IsSUFBSztJQUNwRCxNQUFNO01BQUUyRCxRQUFRO01BQUV6RCxRQUFRO0VBQUVELElBQUFBO0VBQU8sR0FBQyxHQUFHRCxLQUFLO0VBRTVDLEVBQUEsTUFBTUcsS0FBcUIsR0FBR3pCLHNCQUFLLENBQUMwSCxPQUFPLENBQUMsTUFBTTtFQUNoRCxJQUFBLE1BQU1oRyxNQUFNLEdBQUdILE1BQU0sRUFBRUcsTUFBTSxJQUFJLEVBQUU7RUFDbkM7RUFDQSxJQUFBLElBQUlBLE1BQU0sQ0FBQ0YsUUFBUSxDQUFDRyxJQUFJLENBQUMsSUFBSSxPQUFPRCxNQUFNLENBQUNGLFFBQVEsQ0FBQ0csSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFO0VBQ3RFLE1BQUEsT0FBT0QsTUFBTSxDQUFDRixRQUFRLENBQUNHLElBQUksQ0FBQztFQUM5QixJQUFBOztFQUVBO01BQ0EsTUFBTWdHLE1BQXNCLEdBQUcsRUFBRTtNQUNqQzVGLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDTixNQUFNLENBQUMsQ0FBQ08sT0FBTyxDQUFFM0IsR0FBRyxJQUFLO1FBQ25DLElBQUlBLEdBQUcsQ0FBQzRCLFVBQVUsQ0FBQyxDQUFBLEVBQUdWLFFBQVEsQ0FBQ0csSUFBSSxDQUFBLENBQUEsQ0FBRyxDQUFDLEVBQUU7RUFDdkMsUUFBQSxNQUFNaUcsS0FBSyxHQUFHdEgsR0FBRyxDQUFDNkIsS0FBSyxDQUFDWCxRQUFRLENBQUNHLElBQUksQ0FBQ1MsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDeUYsS0FBSyxDQUFDLEdBQUcsQ0FBQztFQUM1RCxRQUFBLE1BQU1DLE9BQU8sR0FBR0YsS0FBSyxDQUFDLENBQUMsQ0FBOEI7RUFDckQsUUFBQSxJQUFJVixRQUFRLENBQUNhLFFBQVEsQ0FBQ0QsT0FBTyxDQUFDLEVBQUU7RUFDOUIsVUFBQSxJQUFJLENBQUNILE1BQU0sQ0FBQ0csT0FBTyxDQUFDLEVBQUU7RUFDcEJILFlBQUFBLE1BQU0sQ0FBQ0csT0FBTyxDQUFDLEdBQUcsRUFBRTtFQUN0QixVQUFBO0VBQ0E7WUFDQUgsTUFBTSxDQUFDRyxPQUFPLENBQUMsRUFBRUUsSUFBSSxDQUFDdEcsTUFBTSxDQUFDcEIsR0FBRyxDQUFDLENBQUM7RUFDcEMsUUFBQTtFQUNGLE1BQUE7RUFDRixJQUFBLENBQUMsQ0FBQztFQUNGLElBQUEsT0FBT3FILE1BQU07SUFDZixDQUFDLEVBQUUsQ0FBQ3BHLE1BQU0sRUFBRUMsUUFBUSxDQUFDRyxJQUFJLENBQUMsQ0FBQztFQUUzQixFQUFBLE1BQU1zRyxNQUFNLEdBQUdBLENBQUNILE9BQWtDLEVBQUVJLE1BQWMsS0FBSztNQUNyRSxJQUFJLENBQUNqRCxRQUFRLEVBQUU7RUFDZixJQUFBLE1BQU1rRCxPQUFPLEdBQUcsSUFBSUMsR0FBRyxDQUFDaEIsV0FBVyxDQUFDM0YsS0FBSyxDQUFDcUcsT0FBTyxDQUFDLENBQUMsQ0FBQztFQUNwRCxJQUFBLElBQUlLLE9BQU8sQ0FBQ0UsR0FBRyxDQUFDSCxNQUFNLENBQUMsRUFBRTtFQUN2QkMsTUFBQUEsT0FBTyxDQUFDRyxNQUFNLENBQUNKLE1BQU0sQ0FBQztFQUN4QixJQUFBLENBQUMsTUFBTTtFQUNMQyxNQUFBQSxPQUFPLENBQUNJLEdBQUcsQ0FBQ0wsTUFBTSxDQUFDO0VBQ3JCLElBQUE7RUFDQSxJQUFBLE1BQU1NLElBQUksR0FBRztFQUFFLE1BQUEsR0FBRy9HLEtBQUs7RUFBRSxNQUFBLENBQUNxRyxPQUFPLEdBQUdULEtBQUssQ0FBQ29CLElBQUksQ0FBQ04sT0FBTztPQUFHO0VBQ3pEbEQsSUFBQUEsUUFBUSxDQUFDekQsUUFBUSxDQUFDRyxJQUFJLEVBQUU2RyxJQUFJLENBQUM7SUFDL0IsQ0FBQztFQUVELEVBQUEsb0JBQU94SSxzQkFBSyxDQUFDQyxhQUFhLENBQUNDLGdCQUFHLEVBQUU7RUFBRUMsSUFBQUEsT0FBTyxFQUFFO0VBQU8sR0FBQyxFQUFFLGNBQ25ESCxzQkFBSyxDQUFDQyxhQUFhLENBQ2pCTyxpQkFBSSxFQUNKO0VBQUVGLElBQUFBLEdBQUcsRUFBRSxPQUFPO0VBQUVDLElBQUFBLEVBQUUsRUFBRSxJQUFJO0VBQUVRLElBQUFBLFVBQVUsRUFBRTtLQUFRLEVBQzlDLGVBQ0YsQ0FBQyxlQUNEZixzQkFBSyxDQUFDQyxhQUFhLENBQ2pCQyxnQkFBRyxFQUNIO0VBQ0VJLElBQUFBLEdBQUcsRUFBRSxNQUFNO0VBQ1hHLElBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZpSSxJQUFBQSxtQkFBbUIsRUFBRSxzQkFBc0I7RUFDM0NDLElBQUFBLFVBQVUsRUFBRSxJQUFJO0VBQ2hCQyxJQUFBQSxhQUFhLEVBQUU7RUFDakIsR0FBQyxFQUNELGNBQ0U1SSxzQkFBSyxDQUFDQyxhQUFhLENBQUNDLGdCQUFHLEVBQUU7RUFBRUksSUFBQUEsR0FBRyxFQUFFO0VBQVEsR0FBQyxDQUFDLEVBQzFDLEdBQUc2RyxPQUFPLENBQUMwQixHQUFHLENBQUVYLE1BQU0saUJBQ3BCbEksc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQjZJLGtCQUFLLEVBQ0w7RUFBRXhJLElBQUFBLEdBQUcsRUFBRTRILE1BQU07RUFBRXRGLElBQUFBLEtBQUssRUFBRTtFQUFFbUcsTUFBQUEsU0FBUyxFQUFFO0VBQVM7RUFBRSxHQUFDLEVBQy9DYixNQUNGLENBQ0YsQ0FBQyxFQUNELEdBQUdoQixRQUFRLENBQUM4QixPQUFPLENBQUVsQixPQUFPLElBQUssY0FDL0I5SCxzQkFBSyxDQUFDQyxhQUFhLENBQ2pCQyxnQkFBRyxFQUNIO01BQ0VJLEdBQUcsRUFBRSxDQUFBLEVBQUd3SCxPQUFPLENBQUEsTUFBQSxDQUFRO0VBQ3ZCckgsSUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZndJLElBQUFBLFVBQVUsRUFBRSxRQUFRO0VBQ3BCdkksSUFBQUEsR0FBRyxFQUFFO0VBQ1AsR0FBQyxlQUNEVixzQkFBSyxDQUFDQyxhQUFhLENBQUNpSixrQkFBSyxFQUFFO0VBQUUvSSxJQUFBQSxPQUFPLEVBQUU7S0FBUSxFQUFFMkgsT0FBTyxDQUN6RCxDQUFDLEVBQ0QsR0FBR1gsT0FBTyxDQUFDMEIsR0FBRyxDQUFFWCxNQUFNLElBQUs7RUFDekIsSUFBQSxNQUFNaUIsT0FBTyxHQUFHL0IsV0FBVyxDQUFDM0YsS0FBSyxDQUFDcUcsT0FBTyxDQUFDLENBQUMsQ0FBQ0MsUUFBUSxDQUFDRyxNQUFNLENBQUM7RUFDNUQsSUFBQSxvQkFBT2xJLHNCQUFLLENBQUNDLGFBQWEsQ0FDeEJDLGdCQUFHLEVBQ0g7RUFDRUksTUFBQUEsR0FBRyxFQUFFLENBQUEsRUFBR3dILE9BQU8sQ0FBQSxDQUFBLEVBQUlJLE1BQU0sQ0FBQSxDQUFFO0VBQzNCekgsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZjJJLE1BQUFBLGNBQWMsRUFBRTtFQUNsQixLQUFDLGVBQ0RwSixzQkFBSyxDQUFDQyxhQUFhLENBQUNvSixxQkFBUSxFQUFFO0VBQzVCN0UsTUFBQUEsRUFBRSxFQUFFLENBQUEsRUFBR3NELE9BQU8sQ0FBQSxDQUFBLEVBQUlJLE1BQU0sQ0FBQSxDQUFFO1FBQzFCaUIsT0FBTztFQUNQbEUsTUFBQUEsUUFBUSxFQUFFQSxNQUFNZ0QsTUFBTSxDQUFDSCxPQUFPLEVBQUVJLE1BQU07RUFDeEMsS0FBQyxDQUNILENBQUM7SUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDLENBRU4sQ0FBQyxlQUNEbEksc0JBQUssQ0FBQ0MsYUFBYSxDQUNqQk8saUJBQUksRUFDSjtFQUFFRixJQUFBQSxHQUFHLEVBQUUsTUFBTTtFQUFFVyxJQUFBQSxFQUFFLEVBQUUsSUFBSTtFQUFFRCxJQUFBQSxRQUFRLEVBQUUsRUFBRTtFQUFFc0ksSUFBQUEsS0FBSyxFQUFFO0VBQVMsR0FBQyxFQUN4RCxrSUFDRixDQUFDLENBQ0YsQ0FBQztFQUNKLENBQUM7O0VDOUhEQyxPQUFPLENBQUNDLGNBQWMsR0FBRyxFQUFFO0VBRTNCRCxPQUFPLENBQUNDLGNBQWMsQ0FBQ3pKLFNBQVMsR0FBR0EsU0FBUztFQUU1Q3dKLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDbkksUUFBUSxHQUFHQSxRQUFRO0VBRTFDa0ksT0FBTyxDQUFDQyxjQUFjLENBQUNyRyxhQUFhLEdBQUdBLGFBQWE7RUFFcERvRyxPQUFPLENBQUNDLGNBQWMsQ0FBQ2hFLGNBQWMsR0FBR0EsY0FBYztFQUV0RCtELE9BQU8sQ0FBQ0MsY0FBYyxDQUFDL0IsZUFBZSxHQUFHQSxlQUFlOzs7Ozs7In0=
