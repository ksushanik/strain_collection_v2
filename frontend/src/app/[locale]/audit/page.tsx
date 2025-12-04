'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuditService, AuditLog } from '@/services/audit.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export default function AuditPage() {
    const t = useTranslations('Audit');
    const tCommon = useTranslations('Common');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        userId: '',
        entity: '',
    });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AuditService.getLogs({
                userId: filters.userId ? parseInt(filters.userId) : undefined,
                entity: filters.entity || undefined,
            });
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filters.entity, filters.userId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionStyle = (
        action: string,
    ): { variant: BadgeVariant; className?: string } => {
        switch (action) {
            case 'CREATE':
                return { variant: 'default', className: 'bg-primary/10 text-primary border border-primary/20' };
            case 'UPDATE':
                return { variant: 'secondary', className: 'text-foreground' };
            case 'DELETE':
                return { variant: 'outline', className: 'border-destructive text-destructive bg-destructive/10' };
            default:
                return { variant: 'outline', className: 'text-muted-foreground' };
        }
    };

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('filters')}</CardTitle>
                    <CardDescription>{t('filtersDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1 w-full">
                        <label className="text-sm font-medium mb-2 block">{t('userId')}</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('userIdPlaceholder')}
                                value={filters.userId}
                                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-sm font-medium mb-2 block">{t('entity')}</label>
                        <Input
                            placeholder={t('entityPlaceholder')}
                            value={filters.entity}
                            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                        />
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
                        <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => { setFilters({ userId: '', entity: '' }); fetchLogs(); }}>
                            {t('clear')}
                        </Button>
                        <Button onClick={fetchLogs} className="flex-1 sm:flex-none">
                            {tCommon('search')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-3 md:hidden">
                {loading ? (
                    <Card>
                        <CardContent className="py-6 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </CardContent>
                    </Card>
                ) : logs.length === 0 ? (
                    <Card>
                        <CardContent className="py-6 text-center text-muted-foreground">
                            {t('noLogs')}
                        </CardContent>
                    </Card>
                ) : (
                    logs.map((log) => (
                        <Card key={log.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center justify-between gap-2">
                                    <span>{format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}</span>
                                    {(() => {
                                        const { variant, className } = getActionStyle(log.action);
                                        return (
                                            <Badge variant={variant} className={cn('px-3 py-1 font-semibold', className)}>
                                                {log.action}
                                            </Badge>
                                        );
                                    })()}
                                </CardTitle>
                                <CardDescription className="space-y-1">
                                    <span className="block font-medium text-foreground break-words">
                                        {log.user?.name || log.user?.email || `User #${log.userId}`}
                                    </span>
                                    {log.user?.email && log.user?.name && (
                                        <span className="block text-xs text-muted-foreground break-words">{log.user.email}</span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">{t('entity')}</span>
                                    <span className="font-mono text-xs break-words">{log.entity} / {log.entityId}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">{t('comment')}</span>
                                    <span className="break-words">{log.comment || '-'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">{t('details')}</span>
                                    <span className="text-xs text-muted-foreground break-words">
                                        {log.changes ? JSON.stringify(log.changes) : '-'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="hidden overflow-x-auto rounded-md border bg-white md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('date')}</TableHead>
                            <TableHead>{t('user')}</TableHead>
                            <TableHead>{t('action')}</TableHead>
                            <TableHead>{t('entity')}</TableHead>
                            <TableHead>{t('entityId')}</TableHead>
                            <TableHead>{t('comment')}</TableHead>
                            <TableHead>{t('details')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    {t('noLogs')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {log.user?.name || log.user?.email || `User #${log.userId}`}
                                            </span>
                                            {log.user?.email && log.user?.name && (
                                                <span className="text-xs text-muted-foreground">{log.user.email}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            const { variant, className } = getActionStyle(log.action);
                                            return (
                                                <Badge variant={variant} className={cn('px-3 py-1 font-semibold', className)}>
                                                    {log.action}
                                                </Badge>
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell className="break-words">{log.entity}</TableCell>
                                    <TableCell className="font-mono text-xs break-words">{log.entityId}</TableCell>
                                    <TableCell className="max-w-[200px] text-xs break-words">
                                        {log.comment || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px] text-xs text-muted-foreground break-words" title={JSON.stringify(log.changes, null, 2)}>
                                            {log.changes ? JSON.stringify(log.changes) : '-'}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
