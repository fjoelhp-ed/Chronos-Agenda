import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptData, decryptData } from './crypto';

test('crypto encrypts and decrypts string correctly with passphrase', async () => {
  const secretText = 'Reunión confidencial de estrategia con el equipo directivo';
  const password = 'SuperClaveSegura2026!';

  const encrypted = await encryptData(secretText, password);

  assert.ok(encrypted.cipher, 'Ciphertext should be produced');
  assert.ok(encrypted.iv, 'IV should be produced');
  assert.ok(encrypted.salt, 'Salt should be produced');
  assert.notEqual(encrypted.cipher, secretText, 'Ciphertext must not be plaintext');

  const decrypted = await decryptData(encrypted, password);
  assert.equal(decrypted, secretText, 'Decrypted text must match original');
});

test('crypto fails to decrypt when passphrase is wrong', async () => {
  const secretText = 'Datos privados';
  const encrypted = await encryptData(secretText, 'ContraseñaCorrecta');

  await assert.rejects(
    async () => {
      await decryptData(encrypted, 'ContraseñaIncorrecta');
    },
    /operation failed|bad key|decryption/i
  );
});
