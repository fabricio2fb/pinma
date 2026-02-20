import type { Reminder, Group } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockReminders: Reminder[] = [
  {
    id: '1',
    name: 'Comprar manteiga, leite e pão',
    location: 'Mercado Boa Esperança',
    distance: '1.2 km de você',
    category: 'Mercado',
    priority: 'Normal',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Pegar remédio para dor de cabeça',
    location: 'Farmácia Central',
    distance: '3.4 km de você',
    category: 'Farmácia',
    priority: 'Urgente',
    status: 'Ativo',
  },
  {
    id: '3',
    name: 'Depositar cheque',
    location: 'Agência Bancária Principal',
    distance: '500 m de você',
    category: 'Banco',
    priority: 'Normal',
    group: 'Família',
    status: 'Concluído',
  },
  {
    id: '4',
    name: 'Não esquecer de regar as plantas',
    location: 'Casa',
    distance: 'Você está aqui',
    category: 'Casa',
    priority: 'Normal',
    status: 'Concluído',
  },
  {
    id: '5',
    name: 'Finalizar relatório mensal',
    location: 'Escritório',
    distance: '8.1 km de você',
    category: 'Trabalho',
    priority: 'Urgente',
    status: 'Ativo',
  },
];

export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Família',
    members: 4,
    activeReminders: 2,
    avatars: [
      PlaceHolderImages.find(i => i.id === 'avatar-1')?.imageUrl || '',
      PlaceHolderImages.find(i => i.id === 'avatar-2')?.imageUrl || '',
      PlaceHolderImages.find(i => i.id === 'avatar-3')?.imageUrl || '',
      PlaceHolderImages.find(i => i.id === 'avatar-4')?.imageUrl || '',
    ],
  },
  {
    id: 'g2',
    name: 'Projeto X',
    members: 8,
    activeReminders: 5,
    avatars: [
        PlaceHolderImages.find(i => i.id === 'avatar-2')?.imageUrl || '',
        PlaceHolderImages.find(i => i.id === 'avatar-4')?.imageUrl || '',
    ],
  },
  {
    id: 'g3',
    name: 'Viagem de Férias',
    members: 3,
    activeReminders: 1,
    avatars: [
      PlaceHolderImages.find(i => i.id === 'avatar-1')?.imageUrl || '',
      PlaceHolderImages.find(i => i.id === 'avatar-3')?.imageUrl || '',
    ],
  },
];
