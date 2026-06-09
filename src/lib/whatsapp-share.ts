// WhatsApp Share helper - generates personal message per guest
import { dummyInvitations } from './dummy-data';
const invitation = dummyInvitations[0];

export function generateWhatsAppLink(guestName: string, guestToken: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wedding.example.com';
  const inviteUrl = `${baseUrl}/i/${invitation.slug}?guest=${guestToken}`;

  const message = encodeURIComponent(
    `Assalamualaikum Wr. Wb.\n\n` +
    `Kepada Yth. ${guestName}\n\n` +
    `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i ` +
    `untuk menghadiri acara pernikahan kami:\n\n` +
    `💍 ${invitation.groom_name} & ${invitation.bride_name}\n` +
    `📅 ${invitation.event_date}\n\n` +
    `Berikut link undangan digital kami:\n` +
    `${inviteUrl}\n\n` +
    `Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir. ` +
    `Terima kasih.\n\n` +
    `Wassalamualaikum Wr. Wb.\n` +
    `— ${invitation.groom_name} & ${invitation.bride_name}`
  );

  return `https://wa.me/?text=${message}`;
}

export function shareToWhatsApp(guestName: string, guestToken: string) {
  const url = generateWhatsAppLink(guestName, guestToken);
  window.open(url, '_blank');
}

export function shareGenericInvitation() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wedding.example.com';
  const inviteUrl = `${baseUrl}/i/${invitation.slug}`;

  const message = encodeURIComponent(
    `Assalamualaikum Wr. Wb.\n\n` +
    `Kami mengundang Anda untuk hadir di hari bahagia kami:\n\n` +
    `💍 ${invitation.groom_name} & ${invitation.bride_name}\n` +
    `📅 ${invitation.event_date}\n\n` +
    `Link undangan:\n${inviteUrl}\n\n` +
    `— ${invitation.groom_name} & ${invitation.bride_name}`
  );

  const url = `https://wa.me/?text=${message}`;
  window.open(url, '_blank');
}
