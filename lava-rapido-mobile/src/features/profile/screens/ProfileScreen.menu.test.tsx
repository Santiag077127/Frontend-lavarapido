import fs from 'node:fs';
import path from 'node:path';

test('the profile keeps functional menu entries without the inert settings option', () => {
  const screen = fs.readFileSync(path.join(__dirname, 'ProfileScreen.tsx'), 'utf8');
  const sections = fs.readFileSync(path.join(__dirname, '../components/ProfileSections.tsx'), 'utf8');

  expect(sections).not.toContain('icon="settings-outline"');
  expect(sections).not.toContain("title={t('profile.settings')}");
  expect(screen).toContain("'EditProfile'");
  expect(sections).not.toContain("title={t('changePassword.menuTitle')}");
  expect(screen).not.toContain("navigation.navigate('ChangePassword')");
  expect(screen).toContain("'MyVehicles'");
  expect(screen).toContain('<ProfilePreferences');
  expect(sections).toContain('<LanguageSelector');
});
