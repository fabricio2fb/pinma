export type Reminder = {
  id: string;
  name: string;
  location: string;
  distance?: string;
  category: 'Mercado' | 'Farmácia' | 'Banco' | 'Casa' | 'Trabalho' | 'Outro';
  priority: 'Normal' | 'Urgente';
  group?: string;
  status: 'Ativo' | 'Concluído';
  position?: { lat: number; lng: number };
};

export type Group = {
  id: string;
  name: string;
  members: number;
  activeReminders: number;
  avatars: string[];
};
