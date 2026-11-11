import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { contact } from '../data/contact';

// Built once at build time into a static .vcf file (vCard 3.0 is what iOS and
// Android import most reliably).
export const GET: APIRoute = async () => {
    const photo = await sharp('public/profile.png')
        .resize(256, 256, { fit: 'cover', position: 'top' })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 80 })
        .toBuffer();

    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${contact.lastName};${contact.firstName};;;`,
        `FN:${contact.firstName} ${contact.lastName}`,
        `ORG:${contact.org}`,
        `TITLE:${contact.title}`,
        `EMAIL;TYPE=INTERNET,WORK:${contact.email}`,
        ...(contact.phone ? [`TEL;TYPE=CELL:${contact.phone}`] : []),
        `URL:${contact.website}`,
        ...contact.profiles.map((p) => `X-SOCIALPROFILE;TYPE=${p.type}:${p.url}`),
        `NOTE:${contact.note}`,
        `PHOTO;ENCODING=b;TYPE=JPEG:${photo.toString('base64')}`,
        'END:VCARD',
    ];

    // vCard requires CRLF line endings and folding of lines longer than 75 octets
    const fold = (line: string) => line.match(/.{1,74}/g)!.join('\r\n ');
    return new Response(lines.map(fold).join('\r\n') + '\r\n', {
        headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
    });
};
