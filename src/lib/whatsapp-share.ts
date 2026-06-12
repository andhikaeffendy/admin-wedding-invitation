// WhatsApp Share helper - generates personal message per guest
import { dummyInvitations } from './dummy-data';
const WEDDING_URL = process.env.NEXT_PUBLIC_WEDDING_URL || 'https://wedding-invitation-liart-alpha.vercel.app';

function buildMessage(guestName: string, inviteUrl: string, groomName?: string, brideName?: string, eventDate?: string) {
  const groom = groomName || (dummyInvitations[0]?.groom_name || 'Calon Pria');
  const bride = brideName || (dummyInvitations[0]?.bride_name || 'Calon Wanita');
  const date = eventDate || (dummyInvitations[0]?.event_date || '');
  return encodeURIComponent(
    `Assalamualaikum Wr. Wb.\n\n` +
    `Kepada Yth. ${guestName}\n\n` +
    `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i ` +
    `untuk menghadiri acara pernikahan kami:\n\n` +
    `💍 ${groom} & ${bride}\n` +
    `📅 ${date}\n\n` +
    `Berikut link undangan digital kami:\n` +
    `${inviteUrl}\n\n` +
    `Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir. ` +
    `Terima kasih.\n\n` +
    `Wassalamualaikum Wr. Wb.\n` +
    `— ${groom} & ${bride}`
  );
}

export function generateWhatsAppLink(guestName: string, guestToken: string, slug?: string, groomName?: string, brideName?: string, eventDate?: string): string {
  const inviteUrl = `${WEDDING_URL}/i/${slug || dummyInvitations[0]?.slug}?guest=${guestToken}`;
  const message = buildMessage(guestName, inviteUrl, groomName, brideName, eventDate);
  return `https://wa.me/?text=${message}`;
}

export function shareToWhatsApp(guestName: string, guestToken: string, slug?: string) {
  const url = generateWhatsAppLink(guestName, guestToken, slug);
  window.open(url, '_blank');
}

export function shareGenericInvitation(slug?: string, groomName?: string, brideName?: string, eventDate?: string) {
  const inviteUrl = `${WEDDING_URL}/i/${slug || dummyInvitations[0]?.slug}`;
  const message = buildMessage('Bapak/Ibu/Saudara/i', inviteUrl, groomName, brideName, eventDate);
  const url = `https://wa.me/?text=${message}`;
  window.open(url, '_blank');
}
