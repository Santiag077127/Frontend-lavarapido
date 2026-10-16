import fs from 'node:fs';
import path from 'node:path';

test('el perfil de usuario no vuelve a renderizar la opción inerte de Configuración', () => {
  const screen = fs.readFileSync(path.join(__dirname, 'ProfileScreen.tsx'), 'utf8');

  expect(screen).not.toContain('icon="settings-outline"');
  expect(screen).not.toContain("title={t('profile.settings')}");
  expect(screen).toContain("'EditProfile'");
  expect(screen).not.toContain("title={t('changePassword.menuTitle')}");
  expect(screen).not.toContain("navigation.navigate('ChangePassword')");
  expect(screen).toContain("'MyVehicles'");
  expect(screen).toContain('<LanguageSelector');
});
