import React, { useState } from 'react';
import { ApiClient, ActionProps, NoticeMessage, useNotice } from 'adminjs';
import { Box, Button, Text, TextArea } from '@adminjs/design-system';

const api = new ApiClient();

export default function RestoreBackup(props: ActionProps) {
  const { resource } = props;
  const addNotice = useNotice();
  const [backupJson, setBackupJson] = useState('');
  const [restoring, setRestoring] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBackupJson(text);
  };

  const handleSubmit = async () => {
    if (!backupJson.trim()) {
      addNotice({ message: 'Выберите файл или вставьте JSON бэкапа', type: 'error' } as NoticeMessage);
      return;
    }
    setRestoring(true);
    try {
      const response = await api.resourceAction({
        resourceId: resource.id,
        actionName: 'restore',
        method: 'post',
        data: { backupJson },
      });
      const notice = response.data?.notice;
      if (notice) addNotice(notice as NoticeMessage);
    } catch (error: any) {
      addNotice({ message: error?.message || 'Restore failed', type: 'error' } as NoticeMessage);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Box variant="grey">
      <Text mb="md">
        Восстановление: выберите файл с JSON-бэкапом или вставьте содержимое вручную. Данные будут перезаписаны.
      </Text>
      <label style={{ display: 'inline-block', marginBottom: 12 }}>
        <Button as="span" variant="primary" size="sm">
          Выбрать файл
        </Button>
        <input
          type="file"
          accept="application/json"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </label>
      <TextArea
        width="100%"
        minHeight="320px"
        onChange={(e: any) => setBackupJson(e.target.value)}
        value={backupJson}
        placeholder={'{ "samples": [...], "strains": [...] }'}
      />
      <Button mt="lg" variant="primary" onClick={handleSubmit} disabled={restoring}>
        {restoring ? 'Восстановление...' : 'Восстановить'}
      </Button>
    </Box>
  );
}
