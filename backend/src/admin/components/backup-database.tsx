import React, { useState } from 'react';
import { ApiClient, ActionProps, NoticeMessage, useNotice } from 'adminjs';
import { Box, Button, Text, TextArea } from '@adminjs/design-system';

const api = new ApiClient();

export default function BackupDatabase(props: ActionProps) {
  const { resource } = props;
  const addNotice = useNotice();
  const [backupJson, setBackupJson] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await api.resourceAction({
        resourceId: resource.id,
        actionName: 'backup',
        method: 'post',
      });
      const notice = response.data?.notice;
      if (notice) addNotice(notice as NoticeMessage);
      const json = (response.data as any)?.backup as string;
      if (json) {
        setBackupJson(json);
      }
    } catch (error: any) {
      addNotice({
        message: error?.message || 'Не удалось создать бэкап',
        type: 'error',
      } as NoticeMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = () => {
    if (!backupJson) return;
    const blob = new Blob([backupJson], { type: 'application/json' });
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
        type: 'success',
      } as NoticeMessage);
    } catch {
      addNotice({
        message: 'Не удалось скопировать',
        type: 'error',
      } as NoticeMessage);
    }
  };

  return (
    <Box variant="grey">
      <Text mb="md">
        Создайте бэкап и сохраните его как JSON (скачайте файл или скопируйте содержимое).
      </Text>
      <Button
        variant="primary"
        size="sm"
        onClick={handleCreate}
        disabled={creating}
        mr="md"
      >
        {creating ? 'Создаём…' : 'Создать бэкап'}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownload}
        disabled={!backupJson}
        mr="sm"
      >
        Скачать JSON
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        disabled={!backupJson}
      >
        Копировать
      </Button>

      <TextArea
        mt="lg"
        width="100%"
        minHeight="320px"
        onChange={(e: any) => setBackupJson(e.target.value)}
        value={backupJson}
        placeholder="Результат бэкапа появится здесь"
        readOnly
      />
    </Box>
  );
}
