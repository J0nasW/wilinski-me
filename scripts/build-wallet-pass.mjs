#!/usr/bin/env node
// Builds a signed Apple Wallet pass (.pkpass) whose QR code opens wilinski.me/qr.
//
// Requirements (Apple Developer Program):
//   1. Create a Pass Type ID (e.g. pass.me.wilinski.card) and its certificate.
//   2. Export certificate + private key as PEM files, and download Apple's
//      WWDR G4 intermediate certificate:
//        openssl pkcs12 -in Certificates.p12 -clcerts -nokeys -out signer-cert.pem
//        openssl pkcs12 -in Certificates.p12 -nocerts -out signer-key.pem
//        openssl x509 -inform der -in AppleWWDRCAG4.cer -out wwdr.pem
//   3. Put the three files in ./.wallet/ (gitignored) and run:
//        PASS_TYPE_ID=pass.me.wilinski.card TEAM_ID=ABCDE12345 \
//        WALLET_KEY_PASSPHRASE=... node scripts/build-wallet-pass.mjs
//
// Output: public/wallet/<WALLET_TOKEN>/jonas-wilinski.pkpass, served at an
// unlisted URL. The pass only holds what /card already shows publicly.

import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const certDir = process.env.WALLET_CERT_DIR || join(root, '.wallet');
const passTypeIdentifier = process.env.PASS_TYPE_ID;
const teamIdentifier = process.env.TEAM_ID;
const token = process.env.WALLET_TOKEN || randomBytes(9).toString('base64url');

if (!passTypeIdentifier || !teamIdentifier) {
    console.error('Set PASS_TYPE_ID and TEAM_ID (see the header of this script).');
    process.exit(1);
}
for (const f of ['signer-cert.pem', 'signer-key.pem', 'wwdr.pem']) {
    if (!existsSync(join(certDir, f))) {
        console.error(`Missing ${join(certDir, f)}`);
        process.exit(1);
    }
}

const ink = 'rgb(35, 78, 122)';
const pass = {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber: 'jonas-wilinski-card-1',
    organizationName: 'Jonas Wilinski',
    description: 'Jonas Wilinski, contact card',
    logoText: 'Jonas Wilinski',
    backgroundColor: ink,
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(188, 207, 229)',
    sharingProhibited: false,
    barcodes: [
        {
            format: 'PKBarcodeFormatQR',
            message: 'https://wilinski.me/qr',
            messageEncoding: 'iso-8859-1',
            altText: 'wilinski.me',
        },
    ],
    generic: {
        primaryFields: [{ key: 'name', label: 'ML engineer & researcher', value: 'Jonas Wilinski' }],
        secondaryFields: [{ key: 'org', label: 'PhD candidate', value: 'Hamburg University of Technology' }],
        auxiliaryFields: [{ key: 'field', label: 'Focus', value: 'NLP models & data infrastructure' }],
        backFields: [
            { key: 'email', label: 'Email', value: 'jonas@wilinski.me' },
            { key: 'web', label: 'Website', value: 'https://wilinski.me' },
            { key: 'linkedin', label: 'LinkedIn', value: 'https://www.linkedin.com/in/jonas-wilinski-a31a35143/' },
            { key: 'orcid', label: 'ORCID', value: 'https://orcid.org/0009-0005-4672-7197' },
        ],
    },
};

const work = mkdtempSync(join(tmpdir(), 'pkpass-'));
try {
    writeFileSync(join(work, 'pass.json'), JSON.stringify(pass, null, 2));

    // Icon (notifications, Mail) and logo: initials on ink; thumbnail: profile photo
    const initials = (size) =>
        Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
            <rect width="100%" height="100%" fill="${ink}"/>
            <text x="50%" y="54%" font-family="Georgia, serif" font-size="${size * 0.48}" fill="#fff"
                  text-anchor="middle" dominant-baseline="middle">JW</text></svg>`);
    for (const [name, size] of [['icon.png', 29], ['icon@2x.png', 58], ['icon@3x.png', 87]]) {
        await sharp(initials(size)).png().toFile(join(work, name));
    }
    for (const [name, size] of [['thumbnail.png', 90], ['thumbnail@2x.png', 180], ['thumbnail@3x.png', 270]]) {
        await sharp(join(root, 'public/profile.png')).resize(size, size, { fit: 'cover', position: 'top' }).png().toFile(join(work, name));
    }

    const files = ['pass.json', 'icon.png', 'icon@2x.png', 'icon@3x.png', 'thumbnail.png', 'thumbnail@2x.png', 'thumbnail@3x.png'];
    const manifest = Object.fromEntries(
        files.map((f) => [f, createHash('sha1').update(readFileSync(join(work, f))).digest('hex')]),
    );
    writeFileSync(join(work, 'manifest.json'), JSON.stringify(manifest));

    const signArgs = [
        'smime', '-binary', '-sign',
        '-certfile', join(certDir, 'wwdr.pem'),
        '-signer', join(certDir, 'signer-cert.pem'),
        '-inkey', join(certDir, 'signer-key.pem'),
        '-in', join(work, 'manifest.json'),
        '-out', join(work, 'signature'),
        '-outform', 'DER',
    ];
    if (process.env.WALLET_KEY_PASSPHRASE) signArgs.push('-passin', 'env:WALLET_KEY_PASSPHRASE');
    execFileSync('openssl', signArgs, { stdio: 'inherit' });

    const outDir = join(root, 'public/wallet', token);
    mkdirSync(outDir, { recursive: true });
    const out = join(outDir, 'jonas-wilinski.pkpass');
    rmSync(out, { force: true });
    execFileSync('zip', ['-q', '-j', out, ...files.map((f) => join(work, f)), join(work, 'manifest.json'), join(work, 'signature')]);

    console.log(`Pass written to ${out}`);
    console.log(`After deploying, open on your iPhone: https://wilinski.me/wallet/${token}/jonas-wilinski.pkpass`);
} finally {
    rmSync(work, { recursive: true, force: true });
}
