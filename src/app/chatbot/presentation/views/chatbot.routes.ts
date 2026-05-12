import { Routes } from '@angular/router';

export const CHATBOT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./chatbot/chatbot').then(m => m.Chatbot),
    title: 'pageTitle.chatbot',
  },
  {
    path: 'conversations',
    loadComponent: () => import('./conversations/conversations').then(m => m.Conversations),
    title: 'pageTitle.conversations',
  },
];
