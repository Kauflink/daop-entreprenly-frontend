import { Routes } from '@angular/router';

export const CHATBOT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./chatbot/chatbot').then(m => m.Chatbot),
    title: 'Entreprenly - Chatbot',
  },
  {
    path: 'conversations',
    loadComponent: () => import('./conversations/conversations').then(m => m.Conversations),
    title: 'Entreprenly - Conversaciones',
  },
];
