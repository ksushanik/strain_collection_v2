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
    }, 'Permissions Matrix'), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
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
    }, 'Tip: checking all + manage grants full access for a subject. Use the checkboxes to toggle allowed actions.')]);
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.JsonShow = JsonShow;
  AdminJS.UserComponents.RestoreBackup = RestoreBackup;
  AdminJS.UserComponents.BackupDatabase = BackupDatabase;
  AdminJS.UserComponents.PermissionsGrid = PermissionsGrid;

})(React, AdminJSDesignSystem, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9kYXNoYm9hcmQudHMiLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9qc29uLXNob3cudHMiLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9yZXN0b3JlLWJhY2t1cC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9iYWNrdXAtZGF0YWJhc2UudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcGVybWlzc2lvbnMtZ3JpZC50cyIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEJveCwgSDIsIFRleHQsIEJ1dHRvbiB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5cclxuY29uc3QgRGFzaGJvYXJkID0gKCkgPT4ge1xyXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KEJveCwgeyB2YXJpYW50OiAnZ3JleScsIHA6ICd4bCcgfSwgW1xyXG4gICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgSDIsXHJcbiAgICAgIHsga2V5OiAnaGVhZGVyJywgbWI6ICdsZycgfSxcclxuICAgICAgJ1N0cmFpbiBDb2xsZWN0aW9uIEFkbWluJyxcclxuICAgICksXHJcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICBUZXh0LFxyXG4gICAgICB7IGtleTogJ3RleHQnLCBtYjogJ3hsJyB9LFxyXG4gICAgICAn0JTQvtCx0YDQviDQv9C+0LbQsNC70L7QstCw0YLRjCDQsiDQv9Cw0L3QtdC70Ywg0YPQv9GA0LDQstC70LXQvdC40Y8gU3RyYWluIENvbGxlY3Rpb24uINCY0YHQv9C+0LvRjNC30YPQudGC0LUg0LzQtdC90Y4g0YHQu9C10LLQsCDQtNC70Y8g0L3QsNCy0LjQs9Cw0YbQuNC4INC/0L4g0YDQtdGB0YPRgNGB0LDQvC4nLFxyXG4gICAgKSxcclxuICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQm94LCB7IGtleTogJ3N0YXRzJywgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICdsZycgfSwgW1xyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgIEJveCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBrZXk6ICdzdHJhaW5zJyxcclxuICAgICAgICAgIHA6ICdsZycsXHJcbiAgICAgICAgICBiZzogJ3doaXRlJyxcclxuICAgICAgICAgIGJveFNoYWRvdzogJ2NhcmQnLFxyXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAnc20nLFxyXG4gICAgICAgICAgZmxleDogMSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgIFRleHQsXHJcbiAgICAgICAgICAgIHsga2V5OiAnc3RyYWlucy1sYWJlbCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9LFxyXG4gICAgICAgICAgICAnU3RyYWlucycsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgVGV4dCxcclxuICAgICAgICAgICAgeyBrZXk6ICdzdHJhaW5zLWRlc2MnLCBmb250U2l6ZTogJ3NtJywgbXQ6ICdzbScgfSxcclxuICAgICAgICAgICAgJ9Cj0L/RgNCw0LLQu9C10L3QuNC1INGI0YLQsNC80LzQsNC80Lgg0LzQuNC60YDQvtC+0YDQs9Cw0L3QuNC30LzQvtCyJyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBCdXR0b24sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBrZXk6ICdzdHJhaW5zLWJ0bicsXHJcbiAgICAgICAgICAgICAgbXQ6ICdtZCcsXHJcbiAgICAgICAgICAgICAgYXM6ICdhJyxcclxuICAgICAgICAgICAgICBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TdHJhaW4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAn0J/QtdGA0LXQudGC0LgnLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICBdLFxyXG4gICAgICApLFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgIEJveCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBrZXk6ICdzYW1wbGVzJyxcclxuICAgICAgICAgIHA6ICdsZycsXHJcbiAgICAgICAgICBiZzogJ3doaXRlJyxcclxuICAgICAgICAgIGJveFNoYWRvdzogJ2NhcmQnLFxyXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAnc20nLFxyXG4gICAgICAgICAgZmxleDogMSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgIFRleHQsXHJcbiAgICAgICAgICAgIHsga2V5OiAnc2FtcGxlcy1sYWJlbCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9LFxyXG4gICAgICAgICAgICAnU2FtcGxlcycsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgVGV4dCxcclxuICAgICAgICAgICAgeyBrZXk6ICdzYW1wbGVzLWRlc2MnLCBmb250U2l6ZTogJ3NtJywgbXQ6ICdzbScgfSxcclxuICAgICAgICAgICAgJ9Cj0L/RgNCw0LLQu9C10L3QuNC1INC+0LHRgNCw0LfRhtCw0LzQuCDQuCDRgdCx0L7RgNCw0LzQuCcsXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgQnV0dG9uLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAga2V5OiAnc2FtcGxlcy1idG4nLFxyXG4gICAgICAgICAgICAgIG10OiAnbWQnLFxyXG4gICAgICAgICAgICAgIGFzOiAnYScsXHJcbiAgICAgICAgICAgICAgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvU2FtcGxlJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ9Cf0LXRgNC10LnRgtC4JyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgXSxcclxuICAgICAgKSxcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuICAgICAgICBCb3gsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAga2V5OiAnc3RvcmFnZScsXHJcbiAgICAgICAgICBwOiAnbGcnLFxyXG4gICAgICAgICAgYmc6ICd3aGl0ZScsXHJcbiAgICAgICAgICBib3hTaGFkb3c6ICdjYXJkJyxcclxuICAgICAgICAgIGJvcmRlclJhZGl1czogJ3NtJyxcclxuICAgICAgICAgIGZsZXg6IDEsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBUZXh0LFxyXG4gICAgICAgICAgICB7IGtleTogJ3N0b3JhZ2UtbGFiZWwnLCBmb250V2VpZ2h0OiAnYm9sZCcgfSxcclxuICAgICAgICAgICAgJ1N0b3JhZ2UnLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgIFRleHQsXHJcbiAgICAgICAgICAgIHsga2V5OiAnc3RvcmFnZS1kZXNjJywgZm9udFNpemU6ICdzbScsIG10OiAnc20nIH0sXHJcbiAgICAgICAgICAgICfQo9C/0YDQsNCy0LvQtdC90LjQtSDRhdGA0LDQvdC40LvQuNGJ0LXQvCDQuCDRj9GH0LXQudC60LDQvNC4JyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICBCdXR0b24sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBrZXk6ICdzdG9yYWdlLWJ0bicsXHJcbiAgICAgICAgICAgICAgbXQ6ICdtZCcsXHJcbiAgICAgICAgICAgICAgYXM6ICdhJyxcclxuICAgICAgICAgICAgICBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TdG9yYWdlQm94JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ9Cf0LXRgNC10LnRgtC4JyxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgXSxcclxuICAgICAgKSxcclxuICAgIF0pLFxyXG4gIF0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGFzaGJvYXJkO1xyXG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcclxuaW1wb3J0IHsgQmFzZVByb3BlcnR5UHJvcHMgfSBmcm9tICdhZG1pbmpzJztcclxuXHJcbmNvbnN0IEpzb25TaG93ID0gKHByb3BzOiBCYXNlUHJvcGVydHlQcm9wcykgPT4ge1xyXG4gIGNvbnN0IHsgcmVjb3JkLCBwcm9wZXJ0eSB9ID0gcHJvcHM7XHJcbiAgLy8gQWRtaW5KUyBmbGF0dGVucyBvYmplY3RzIGluIHJlY29yZC5wYXJhbXMsIHNvICdjaGFuZ2VzLmNvbHMnIG1pZ2h0IGJlIHRoZXJlIGluc3RlYWQgb2YgJ2NoYW5nZXMnIG9iamVjdC5cclxuICAvLyBCdXQgZm9yICdtaXhlZCcgb3IgJ2pzb24nIHR5cGUsIGl0IHNob3VsZCBiZSBhdmFpbGFibGUuXHJcbiAgLy8gSG93ZXZlciwgc2luY2Ugd2UgY2hhbmdlZCB0eXBlIHRvICd0ZXh0YXJlYScgcHJldmlvdXNseSwgbGV0J3MgcmV2ZXJ0IHRvICdtaXhlZCcgb3IgaGFuZGxlIGl0IGNhcmVmdWxseS5cclxuICAvLyBBY3R1YWxseSwgbGV0J3MgdHJ5IHRvIGdldCB0aGUgcmF3IHZhbHVlLlxyXG5cclxuICBsZXQgdmFsdWUgPSByZWNvcmQ/LnBhcmFtcz8uW3Byb3BlcnR5LnBhdGhdO1xyXG5cclxuICAvLyBJZiB2YWx1ZSBpcyBtaXNzaW5nLCB0cnkgdG8gcmVjb25zdHJ1Y3QgZnJvbSBmbGF0dGVuZWQgcGFyYW1zIGlmIGl0J3MgYW4gb2JqZWN0XHJcbiAgaWYgKCF2YWx1ZSAmJiByZWNvcmQ/LnBhcmFtcykge1xyXG4gICAgY29uc3QgcHJlZml4ID0gYCR7cHJvcGVydHkucGF0aH0uYDtcclxuICAgIGNvbnN0IG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcclxuICAgIGxldCBoYXNLZXlzID0gZmFsc2U7XHJcbiAgICBPYmplY3Qua2V5cyhyZWNvcmQucGFyYW1zKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgaWYgKGtleS5zdGFydHNXaXRoKHByZWZpeCkpIHtcclxuICAgICAgICBvYmpba2V5LnNsaWNlKHByZWZpeC5sZW5ndGgpXSA9IHJlY29yZC5wYXJhbXNba2V5XTtcclxuICAgICAgICBoYXNLZXlzID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAoaGFzS2V5cykgdmFsdWUgPSBvYmo7XHJcbiAgfVxyXG5cclxuICBpZiAoIXZhbHVlKSB7XHJcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIG51bGwsICctJyk7XHJcbiAgfVxyXG5cclxuICBsZXQgZGlzcGxheVZhbHVlID0gdmFsdWU7XHJcbiAgdHJ5IHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGRpc3BsYXlWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICBpZiAodmFsdWUudHJpbSgpLnN0YXJ0c1dpdGgoJ3snKSB8fCB2YWx1ZS50cmltKCkuc3RhcnRzV2l0aCgnWycpKSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh2YWx1ZSk7XHJcbiAgICAgICAgZGlzcGxheVZhbHVlID0gSlNPTi5zdHJpbmdpZnkocGFyc2VkLCBudWxsLCAyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gaWdub3JlXHJcbiAgfVxyXG5cclxuICBjb25zdCBjb250ZW50ID1cclxuICAgIHR5cGVvZiBkaXNwbGF5VmFsdWUgPT09ICdzdHJpbmcnXHJcbiAgICAgID8gZGlzcGxheVZhbHVlXHJcbiAgICAgIDogSlNPTi5zdHJpbmdpZnkoZGlzcGxheVZhbHVlLCBudWxsLCAyKTtcclxuXHJcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICBCb3gsXHJcbiAgICB7IG1iOiAneGwnIH0sXHJcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAncHJlJyxcclxuICAgICAge1xyXG4gICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnLFxyXG4gICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgIGZvbnRGYW1pbHk6ICdtb25vc3BhY2UnLFxyXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y0ZjZmOCcsXHJcbiAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXHJcbiAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbnRlbnQsXHJcbiAgICApLFxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBKc29uU2hvdztcclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCBBY3Rpb25Qcm9wcywgTm90aWNlTWVzc2FnZSwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCwgVGV4dEFyZWEgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZXN0b3JlQmFja3VwKHByb3BzOiBBY3Rpb25Qcm9wcykge1xuICBjb25zdCB7IHJlc291cmNlIH0gPSBwcm9wcztcbiAgY29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG4gIGNvbnN0IFtiYWNrdXBKc29uLCBzZXRCYWNrdXBKc29uXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Jlc3RvcmluZywgc2V0UmVzdG9yaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCBoYW5kbGVGaWxlID0gYXN5bmMgKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgIHNldEJhY2t1cEpzb24odGV4dCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghYmFja3VwSnNvbi50cmltKCkpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6ICfQktGL0LHQtdGA0LjRgtC1INGE0LDQudC7INC40LvQuCDQstGB0YLQsNCy0YzRgtC1IEpTT04g0LHRjdC60LDQv9CwJywgdHlwZTogJ2Vycm9yJyB9IGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzZXRSZXN0b3JpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcbiAgICAgICAgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG4gICAgICAgIGFjdGlvbk5hbWU6ICdyZXN0b3JlJyxcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIGRhdGE6IHsgYmFja3VwSnNvbiB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZS5kYXRhPy5ub3RpY2U7XG4gICAgICBpZiAobm90aWNlKSBhZGROb3RpY2Uobm90aWNlIGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yPy5tZXNzYWdlIHx8ICdSZXN0b3JlIGZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSBhcyBOb3RpY2VNZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0UmVzdG9yaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHZhcmlhbnQ9XCJncmV5XCI+XG4gICAgICA8VGV4dCBtYj1cIm1kXCI+XG4gICAgICAgINCS0L7RgdGB0YLQsNC90L7QstC70LXQvdC40LU6INCy0YvQsdC10YDQuNGC0LUg0YTQsNC50Lsg0YEgSlNPTi3QsdGN0LrQsNC/0L7QvCDQuNC70Lgg0LLRgdGC0LDQstGM0YLQtSDRgdC+0LTQtdGA0LbQuNC80L7QtSDQstGA0YPRh9C90YPRji4g0JTQsNC90L3Ri9C1INCx0YPQtNGD0YIg0L/QtdGA0LXQt9Cw0L/QuNGB0LDQvdGLLlxuICAgICAgPC9UZXh0PlxuICAgICAgPGxhYmVsIHN0eWxlPXt7IGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBtYXJnaW5Cb3R0b206IDEyIH19PlxuICAgICAgICA8QnV0dG9uIGFzPVwic3BhblwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgc2l6ZT1cInNtXCI+XG4gICAgICAgICAg0JLRi9Cx0YDQsNGC0Ywg0YTQsNC50LtcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICBhY2NlcHQ9XCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlRmlsZX1cbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbGFiZWw+XG4gICAgICA8VGV4dEFyZWFcbiAgICAgICAgd2lkdGg9XCIxMDAlXCJcbiAgICAgICAgbWluSGVpZ2h0PVwiMzIwcHhcIlxuICAgICAgICBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0QmFja3VwSnNvbihlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgIHZhbHVlPXtiYWNrdXBKc29ufVxuICAgICAgICBwbGFjZWhvbGRlcj17J3sgXCJzYW1wbGVzXCI6IFsuLi5dLCBcInN0cmFpbnNcIjogWy4uLl0gfSd9XG4gICAgICAvPlxuICAgICAgPEJ1dHRvbiBtdD1cImxnXCIgdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXtoYW5kbGVTdWJtaXR9IGRpc2FibGVkPXtyZXN0b3Jpbmd9PlxuICAgICAgICB7cmVzdG9yaW5nID8gJ9CS0L7RgdGB0YLQsNC90L7QstC70LXQvdC40LUuLi4nIDogJ9CS0L7RgdGB0YLQsNC90L7QstC40YLRjCd9XG4gICAgICA8L0J1dHRvbj5cbiAgICA8L0JveD5cbiAgKTtcbn1cclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCBBY3Rpb25Qcm9wcywgTm90aWNlTWVzc2FnZSwgdXNlTm90aWNlIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCwgVGV4dEFyZWEgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCYWNrdXBEYXRhYmFzZShwcm9wczogQWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgeyByZXNvdXJjZSB9ID0gcHJvcHM7XG4gIGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuICBjb25zdCBbYmFja3VwSnNvbiwgc2V0QmFja3VwSnNvbl0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtjcmVhdGluZywgc2V0Q3JlYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IGhhbmRsZUNyZWF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRDcmVhdGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVzb3VyY2VBY3Rpb24oe1xuICAgICAgICByZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcbiAgICAgICAgYWN0aW9uTmFtZTogJ2JhY2t1cCcsXG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZS5kYXRhPy5ub3RpY2U7XG4gICAgICBpZiAobm90aWNlKSBhZGROb3RpY2Uobm90aWNlIGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgICAgY29uc3QganNvbiA9IChyZXNwb25zZS5kYXRhIGFzIGFueSk/LmJhY2t1cCBhcyBzdHJpbmc7XG4gICAgICBpZiAoanNvbikge1xuICAgICAgICBzZXRCYWNrdXBKc29uKGpzb24pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgIG1lc3NhZ2U6IGVycm9yPy5tZXNzYWdlIHx8ICfQndC1INGD0LTQsNC70L7RgdGMINGB0L7Qt9C00LDRgtGMINCx0Y3QutCw0L8nLFxuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgfSBhcyBOb3RpY2VNZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0Q3JlYXRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVEb3dubG9hZCA9ICgpID0+IHtcbiAgICBpZiAoIWJhY2t1cEpzb24pIHJldHVybjtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2JhY2t1cEpzb25dLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gdXJsO1xuICAgIGEuZG93bmxvYWQgPSBgYmFja3VwLSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6XS9nLCAnLScpfS5qc29uYDtcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUNvcHkgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFiYWNrdXBKc29uKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGJhY2t1cEpzb24pO1xuICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgbWVzc2FnZTogJ9CR0Y3QutCw0L8g0YHQutC+0L/QuNGA0L7QstCw0L0g0LIg0LHRg9GE0LXRgCDQvtCx0LzQtdC90LAnLFxuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICB9IGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgYWRkTm90aWNlKHtcbiAgICAgICAgbWVzc2FnZTogJ9Cd0LUg0YPQtNCw0LvQvtGB0Ywg0YHQutC+0L/QuNGA0L7QstCw0YLRjCcsXG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICB9IGFzIE5vdGljZU1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxCb3ggdmFyaWFudD1cImdyZXlcIj5cbiAgICAgIDxUZXh0IG1iPVwibWRcIj5cbiAgICAgICAg0KHQvtC30LTQsNC50YLQtSDQsdGN0LrQsNC/INC4INGB0L7RhdGA0LDQvdC40YLQtSDQtdCz0L4g0LrQsNC6IEpTT04gKNGB0LrQsNGH0LDQudGC0LUg0YTQsNC50Lsg0LjQu9C4INGB0LrQvtC/0LjRgNGD0LnRgtC1INGB0L7QtNC10YDQttC40LzQvtC1KS5cbiAgICAgIDwvVGV4dD5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cInByaW1hcnlcIlxuICAgICAgICBzaXplPVwic21cIlxuICAgICAgICBvbkNsaWNrPXtoYW5kbGVDcmVhdGV9XG4gICAgICAgIGRpc2FibGVkPXtjcmVhdGluZ31cbiAgICAgICAgbXI9XCJtZFwiXG4gICAgICA+XG4gICAgICAgIHtjcmVhdGluZyA/ICfQodC+0LfQtNCw0ZHQvOKApicgOiAn0KHQvtC30LTQsNGC0Ywg0LHRjdC60LDQvyd9XG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cInNlY29uZGFyeVwiXG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIG9uQ2xpY2s9e2hhbmRsZURvd25sb2FkfVxuICAgICAgICBkaXNhYmxlZD17IWJhY2t1cEpzb259XG4gICAgICAgIG1yPVwic21cIlxuICAgICAgPlxuICAgICAgICDQodC60LDRh9Cw0YLRjCBKU09OXG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cInNlY29uZGFyeVwiXG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNvcHl9XG4gICAgICAgIGRpc2FibGVkPXshYmFja3VwSnNvbn1cbiAgICAgID5cbiAgICAgICAg0JrQvtC/0LjRgNC+0LLQsNGC0YxcbiAgICAgIDwvQnV0dG9uPlxuXG4gICAgICA8VGV4dEFyZWFcbiAgICAgICAgbXQ9XCJsZ1wiXG4gICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAgIG1pbkhlaWdodD1cIjMyMHB4XCJcbiAgICAgICAgb25DaGFuZ2U9eyhlOiBhbnkpID0+IHNldEJhY2t1cEpzb24oZS50YXJnZXQudmFsdWUpfVxuICAgICAgICB2YWx1ZT17YmFja3VwSnNvbn1cbiAgICAgICAgcGxhY2Vob2xkZXI9XCLQoNC10LfRg9C70YzRgtCw0YIg0LHRjdC60LDQv9CwINC/0L7Rj9Cy0LjRgtGB0Y8g0LfQtNC10YHRjFwiXG4gICAgICAgIHJlYWRPbmx5XG4gICAgICAvPlxuICAgIDwvQm94PlxuICApO1xufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJveCwgTGFiZWwsIENoZWNrQm94LCBUZXh0LCBCYWRnZSB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgQmFzZVByb3BlcnR5UHJvcHMgfSBmcm9tICdhZG1pbmpzJztcblxuY29uc3QgU1VCSkVDVFMgPSBbXG4gICdTdHJhaW4nLFxuICAnU2FtcGxlJyxcbiAgJ1N0b3JhZ2UnLFxuICAnTWVkaWEnLFxuICAnU2V0dGluZ3MnLFxuICAnTGVnZW5kJyxcbiAgJ0FuYWx5dGljcycsXG4gICdVc2VyJyxcbiAgJ0dyb3VwJyxcbiAgJ0F1ZGl0TG9nJyxcbiAgJ1Bob3RvJyxcbiAgJ2FsbCcsXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBBQ1RJT05TID0gWydyZWFkJywgJ2NyZWF0ZScsICd1cGRhdGUnLCAnZGVsZXRlJywgJ21hbmFnZSddIGFzIGNvbnN0O1xuXG50eXBlIFBlcm1pc3Npb25zTWFwID0gUGFydGlhbDxSZWNvcmQ8KHR5cGVvZiBTVUJKRUNUUylbbnVtYmVyXSwgc3RyaW5nW10+PjtcblxuY29uc3QgZW5zdXJlQXJyYXkgPSAodmFsdWU6IHVua25vd24pOiBzdHJpbmdbXSA9PlxuICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLmZpbHRlcigodikgPT4gdHlwZW9mIHYgPT09ICdzdHJpbmcnKSA6IFtdO1xuXG5jb25zdCBQZXJtaXNzaW9uc0dyaWQgPSAocHJvcHM6IEJhc2VQcm9wZXJ0eVByb3BzKSA9PiB7XG4gIGNvbnN0IHsgb25DaGFuZ2UsIHByb3BlcnR5LCByZWNvcmQgfSA9IHByb3BzO1xuXG4gIGNvbnN0IHZhbHVlOiBQZXJtaXNzaW9uc01hcCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHJlY29yZD8ucGFyYW1zID8/IHt9O1xuICAgIC8vIElmIEFkbWluSlMgcGFzc2VzIGl0IGFzIGFuIG9iamVjdCAocmFyZSBidXQgcG9zc2libGUpXG4gICAgaWYgKHBhcmFtc1twcm9wZXJ0eS5wYXRoXSAmJiB0eXBlb2YgcGFyYW1zW3Byb3BlcnR5LnBhdGhdID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHBhcmFtc1twcm9wZXJ0eS5wYXRoXTtcbiAgICB9XG5cbiAgICAvLyBVbmZsYXR0ZW4gbG9naWMgZm9yIHBlcm1pc3Npb25zLntTdWJqZWN0fS57SW5kZXh9XG4gICAgY29uc3QgcmVzdWx0OiBQZXJtaXNzaW9uc01hcCA9IHt9O1xuICAgIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoYCR7cHJvcGVydHkucGF0aH0uYCkpIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBrZXkuc2xpY2UocHJvcGVydHkucGF0aC5sZW5ndGggKyAxKS5zcGxpdCgnLicpO1xuICAgICAgICBjb25zdCBzdWJqZWN0ID0gcGFydHNbMF0gYXMgKHR5cGVvZiBTVUJKRUNUUylbbnVtYmVyXTtcbiAgICAgICAgaWYgKFNVQkpFQ1RTLmluY2x1ZGVzKHN1YmplY3QpKSB7XG4gICAgICAgICAgaWYgKCFyZXN1bHRbc3ViamVjdF0pIHtcbiAgICAgICAgICAgIHJlc3VsdFtzdWJqZWN0XSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUaGUgdmFsdWUgaXMgYXQgdGhpcyBrZXlcbiAgICAgICAgICByZXN1bHRbc3ViamVjdF0/LnB1c2gocGFyYW1zW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwgW3JlY29yZCwgcHJvcGVydHkucGF0aF0pO1xuXG4gIGNvbnN0IHRvZ2dsZSA9IChzdWJqZWN0OiAodHlwZW9mIFNVQkpFQ1RTKVtudW1iZXJdLCBhY3Rpb246IHN0cmluZykgPT4ge1xuICAgIGlmICghb25DaGFuZ2UpIHJldHVybjtcbiAgICBjb25zdCBjdXJyZW50ID0gbmV3IFNldChlbnN1cmVBcnJheSh2YWx1ZVtzdWJqZWN0XSkpO1xuICAgIGlmIChjdXJyZW50LmhhcyhhY3Rpb24pKSB7XG4gICAgICBjdXJyZW50LmRlbGV0ZShhY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50LmFkZChhY3Rpb24pO1xuICAgIH1cbiAgICBjb25zdCBuZXh0ID0geyAuLi52YWx1ZSwgW3N1YmplY3RdOiBBcnJheS5mcm9tKGN1cnJlbnQpIH07XG4gICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dCk7XG4gIH07XG5cbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQm94LCB7IHZhcmlhbnQ6ICdncmV5JyB9LCBbXG4gICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFRleHQsXG4gICAgICB7IGtleTogJ3RpdGxlJywgbWI6ICdzbScsIGZvbnRXZWlnaHQ6ICdib2xkJyB9LFxuICAgICAgJ1Blcm1pc3Npb25zIE1hdHJpeCcsXG4gICAgKSxcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgQm94LFxuICAgICAge1xuICAgICAgICBrZXk6ICdncmlkJyxcbiAgICAgICAgZGlzcGxheTogJ2dyaWQnLFxuICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMTYwcHggcmVwZWF0KDUsIDFmciknLFxuICAgICAgICBncmlkUm93R2FwOiAnbWQnLFxuICAgICAgICBncmlkQ29sdW1uR2FwOiAnbWQnLFxuICAgICAgfSxcbiAgICAgIFtcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChCb3gsIHsga2V5OiAnZW1wdHknIH0pLFxuICAgICAgICAuLi5BQ1RJT05TLm1hcCgoYWN0aW9uKSA9PlxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBMYWJlbCxcbiAgICAgICAgICAgIHsga2V5OiBhY3Rpb24sIHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgYWN0aW9uLFxuICAgICAgICAgICksXG4gICAgICAgICksXG4gICAgICAgIC4uLlNVQkpFQ1RTLmZsYXRNYXAoKHN1YmplY3QpID0+IFtcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgQm94LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBrZXk6IGAke3N1YmplY3R9LWxhYmVsYCxcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgZ2FwOiAneHMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQmFkZ2UsIHsgdmFyaWFudDogJ2luZm8nIH0sIHN1YmplY3QpLFxuICAgICAgICAgICksXG4gICAgICAgICAgLi4uQUNUSU9OUy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tlZCA9IGVuc3VyZUFycmF5KHZhbHVlW3N1YmplY3RdKS5pbmNsdWRlcyhhY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgIEJveCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogYCR7c3ViamVjdH0tJHthY3Rpb259YCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENoZWNrQm94LCB7XG4gICAgICAgICAgICAgICAgaWQ6IGAke3N1YmplY3R9LSR7YWN0aW9ufWAsXG4gICAgICAgICAgICAgICAgY2hlY2tlZCxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogKCkgPT4gdG9nZ2xlKHN1YmplY3QsIGFjdGlvbiksXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSksXG4gICAgICBdLFxuICAgICksXG4gICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFRleHQsXG4gICAgICB7IGtleTogJ2hpbnQnLCBtdDogJ21kJywgZm9udFNpemU6IDEyLCBjb2xvcjogJ2dyZXk2MCcgfSxcbiAgICAgICdUaXA6IGNoZWNraW5nIGFsbCArIG1hbmFnZSBncmFudHMgZnVsbCBhY2Nlc3MgZm9yIGEgc3ViamVjdC4gVXNlIHRoZSBjaGVja2JveGVzIHRvIHRvZ2dsZSBhbGxvd2VkIGFjdGlvbnMuJyxcbiAgICApLFxuICBdKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBlcm1pc3Npb25zR3JpZDtcbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9kYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRhc2hib2FyZCA9IERhc2hib2FyZFxuaW1wb3J0IEpzb25TaG93IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL2pzb24tc2hvdydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuSnNvblNob3cgPSBKc29uU2hvd1xuaW1wb3J0IFJlc3RvcmVCYWNrdXAgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvcmVzdG9yZS1iYWNrdXAnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlc3RvcmVCYWNrdXAgPSBSZXN0b3JlQmFja3VwXG5pbXBvcnQgQmFja3VwRGF0YWJhc2UgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvYmFja3VwLWRhdGFiYXNlJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5CYWNrdXBEYXRhYmFzZSA9IEJhY2t1cERhdGFiYXNlXG5pbXBvcnQgUGVybWlzc2lvbnNHcmlkIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL3Blcm1pc3Npb25zLWdyaWQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlBlcm1pc3Npb25zR3JpZCA9IFBlcm1pc3Npb25zR3JpZCJdLCJuYW1lcyI6WyJEYXNoYm9hcmQiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJCb3giLCJ2YXJpYW50IiwicCIsIkgyIiwia2V5IiwibWIiLCJUZXh0IiwiZGlzcGxheSIsImdhcCIsImJnIiwiYm94U2hhZG93IiwiYm9yZGVyUmFkaXVzIiwiZmxleCIsImZvbnRXZWlnaHQiLCJmb250U2l6ZSIsIm10IiwiQnV0dG9uIiwiYXMiLCJocmVmIiwiSnNvblNob3ciLCJwcm9wcyIsInJlY29yZCIsInByb3BlcnR5IiwidmFsdWUiLCJwYXJhbXMiLCJwYXRoIiwicHJlZml4Iiwib2JqIiwiaGFzS2V5cyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic3RhcnRzV2l0aCIsInNsaWNlIiwibGVuZ3RoIiwiZGlzcGxheVZhbHVlIiwiSlNPTiIsInN0cmluZ2lmeSIsInRyaW0iLCJwYXJzZWQiLCJwYXJzZSIsImNvbnRlbnQiLCJzdHlsZSIsIndoaXRlU3BhY2UiLCJmb250RmFtaWx5IiwiYmFja2dyb3VuZENvbG9yIiwicGFkZGluZyIsImFwaSIsIkFwaUNsaWVudCIsIlJlc3RvcmVCYWNrdXAiLCJyZXNvdXJjZSIsImFkZE5vdGljZSIsInVzZU5vdGljZSIsImJhY2t1cEpzb24iLCJzZXRCYWNrdXBKc29uIiwidXNlU3RhdGUiLCJyZXN0b3JpbmciLCJzZXRSZXN0b3JpbmciLCJoYW5kbGVGaWxlIiwiZSIsImZpbGUiLCJ0YXJnZXQiLCJmaWxlcyIsInRleHQiLCJoYW5kbGVTdWJtaXQiLCJtZXNzYWdlIiwidHlwZSIsInJlc3BvbnNlIiwicmVzb3VyY2VBY3Rpb24iLCJyZXNvdXJjZUlkIiwiaWQiLCJhY3Rpb25OYW1lIiwibWV0aG9kIiwiZGF0YSIsIm5vdGljZSIsImVycm9yIiwibWFyZ2luQm90dG9tIiwic2l6ZSIsImFjY2VwdCIsIm9uQ2hhbmdlIiwiVGV4dEFyZWEiLCJ3aWR0aCIsIm1pbkhlaWdodCIsInBsYWNlaG9sZGVyIiwib25DbGljayIsImRpc2FibGVkIiwiQmFja3VwRGF0YWJhc2UiLCJjcmVhdGluZyIsInNldENyZWF0aW5nIiwiaGFuZGxlQ3JlYXRlIiwianNvbiIsImJhY2t1cCIsImhhbmRsZURvd25sb2FkIiwiYmxvYiIsIkJsb2IiLCJ1cmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJhIiwiZG9jdW1lbnQiLCJkb3dubG9hZCIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInJlcGxhY2UiLCJjbGljayIsInJldm9rZU9iamVjdFVSTCIsImhhbmRsZUNvcHkiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJtciIsInJlYWRPbmx5IiwiU1VCSkVDVFMiLCJBQ1RJT05TIiwiZW5zdXJlQXJyYXkiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJ2IiwiUGVybWlzc2lvbnNHcmlkIiwidXNlTWVtbyIsInJlc3VsdCIsInBhcnRzIiwic3BsaXQiLCJzdWJqZWN0IiwiaW5jbHVkZXMiLCJwdXNoIiwidG9nZ2xlIiwiYWN0aW9uIiwiY3VycmVudCIsIlNldCIsImhhcyIsImRlbGV0ZSIsImFkZCIsIm5leHQiLCJmcm9tIiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsImdyaWRSb3dHYXAiLCJncmlkQ29sdW1uR2FwIiwibWFwIiwiTGFiZWwiLCJ0ZXh0QWxpZ24iLCJmbGF0TWFwIiwiYWxpZ25JdGVtcyIsIkJhZGdlIiwiY2hlY2tlZCIsImp1c3RpZnlDb250ZW50IiwiQ2hlY2tCb3giLCJjb2xvciIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztFQUdBLE1BQU1BLFNBQVMsR0FBR0EsTUFBTTtFQUN0QixFQUFBLG9CQUFPQyxzQkFBSyxDQUFDQyxhQUFhLENBQUNDLGdCQUFHLEVBQUU7RUFBRUMsSUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRUMsSUFBQUEsQ0FBQyxFQUFFO0VBQUssR0FBQyxFQUFFLGNBQzVESixzQkFBSyxDQUFDQyxhQUFhLENBQ2pCSSxl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
