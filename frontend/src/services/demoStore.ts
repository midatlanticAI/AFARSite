import { Appliance } from '@/types/appliance';

export interface DemoUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  address: { street: string; city: string; state: string; zip: string };
  disabled: boolean;
  appliances: Appliance[];
}

const users: DemoUser[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '123-456-7890',
    address: { street: '123 Main St', city: 'Anytown', state: 'VA', zip: '12345' },
    disabled: false,
    appliances: [],
  },
];

export default users;

// @ts-nocheck
const KEY = 'sitepro_demo_opps';

function read(): any[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function write(items: any[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const demoOpps = {
  listAll(): any[] { return read(); },
  listByContact(contactId: string): any[] { return read().filter(x => x.customer_id === contactId); },
  add(opp: any) { const items = read(); items.push(opp); write(items); },
  addForContact(contactId: string, opp: any) {
    const items = read();
    items.push({ ...opp, customer_id: contactId });
    write(items);
  },
  setForContact(contactId: string, list: any[]) {
    const others = read().filter(x => x.customer_id !== contactId);
    write([...others, ...list.map(x => ({ ...x, customer_id: contactId }))]);
  },
};


