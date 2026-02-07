import { render } from '@react-email/render';
import * as emails from './emails';
import * as fs from 'fs';
import * as path from 'path';

async function preview() {
  const html = await render(
    // emails.WelcomeEmail({ name: 'Emmanuel' }),
    emails.VerificationEmail({ token: "198989" })
  );

  const outputPath = path.join(
    __dirname,
    '../../../email-preview.html',
  );

  fs.writeFileSync(outputPath, html);
  console.log('✅ Email preview generated:', outputPath);
}

preview();
