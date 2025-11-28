import React from 'react';
import { Box, H2, Text, Button } from '@adminjs/design-system';

const Dashboard = () => {
    return React.createElement(
        Box,
        { variant: 'grey', p: 'xl' },
        [
            React.createElement(H2, { key: 'header', mb: 'lg' }, 'Strain Collection Admin'),
            React.createElement(
                Text,
                { key: 'text', mb: 'xl' },
                'Добро пожаловать в панель управления Strain Collection. Используйте меню слева для навигации по ресурсам.'
            ),
            React.createElement(
                Box,
                { key: 'stats', display: 'flex', gap: 'lg' },
                [
                    React.createElement(
                        Box,
                        { key: 'strains', p: 'lg', bg: 'white', boxShadow: 'card', borderRadius: 'sm', flex: 1 },
                        [
                            React.createElement(Text, { key: 'strains-label', fontWeight: 'bold' }, 'Strains'),
                            React.createElement(Text, { key: 'strains-desc', fontSize: 'sm', mt: 'sm' }, 'Управление штаммами микроорганизмов'),
                            React.createElement(Button, { key: 'strains-btn', mt: 'md', as: 'a', href: '/admin/resources/Strain' }, 'Перейти')
                        ]
                    ),
                    React.createElement(
                        Box,
                        { key: 'samples', p: 'lg', bg: 'white', boxShadow: 'card', borderRadius: 'sm', flex: 1 },
                        [
                            React.createElement(Text, { key: 'samples-label', fontWeight: 'bold' }, 'Samples'),
                            React.createElement(Text, { key: 'samples-desc', fontSize: 'sm', mt: 'sm' }, 'Управление образцами и сборами'),
                            React.createElement(Button, { key: 'samples-btn', mt: 'md', as: 'a', href: '/admin/resources/Sample' }, 'Перейти')
                        ]
                    ),
                    React.createElement(
                        Box,
                        { key: 'storage', p: 'lg', bg: 'white', boxShadow: 'card', borderRadius: 'sm', flex: 1 },
                        [
                            React.createElement(Text, { key: 'storage-label', fontWeight: 'bold' }, 'Storage'),
                            React.createElement(Text, { key: 'storage-desc', fontSize: 'sm', mt: 'sm' }, 'Управление хранилищем и ячейками'),
                            React.createElement(Button, { key: 'storage-btn', mt: 'md', as: 'a', href: '/admin/resources/StorageBox' }, 'Перейти')
                        ]
                    )
                ]
            )
        ]
    );
};

export default Dashboard;
