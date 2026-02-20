export type Reminder = {
  id: string;
  name: string;
  location: string;
  distance?: string;
  category: 'Mercado' | 'Farmácia' | 'Banco' | 'Casa' | 'Trabalho' | 'Outro';
  priority: 'Normal' | 'Urgente';
  group?: string;
};

export type Group = {
  id: string;
  name: string;
  members: number;
  activeReminders: number;
  avatars: string[];
};
