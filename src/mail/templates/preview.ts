import { render } from '@react-email/render';
import { WelcomeEmail } from './emails/welcome-email';
import * as fs from 'fs';
import * as path from 'path';

async function preview() {
  const html = await render(
    WelcomeEmail({ name: 'Emmanuel' }),
  );

  const outputPath = path.join(
    __dirname,
    '../../../email-preview.html',
  );

  fs.writeFileSync(outputPath, html);
  console.log('✅ Email preview generated:', outputPath);
}

preview();
