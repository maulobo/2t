/**
 * Script para crear el primer usuario ADMIN
 *
 * Este script crea un admin inicial para poder acceder al sistema
 * y gestionar coaches desde el frontend.
 *
 * Uso: node scripts/create-first-admin.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function createFirstAdmin() {
  console.log('🔧 Creando primer usuario ADMIN...\n');

  // Configuración del admin (cambiar según necesidad)
  const adminData = {
    email: process.env.ADMIN_EMAIL || 'admin@smartcloud.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123456!',
    phone: process.env.ADMIN_PHONE || '+541112345678',
  };

  try {
    const response = await fetch(`${API_URL}/auth/register-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al crear admin: ${error}`);
    }

    const result = await response.json();

    console.log('✅ Admin creado exitosamente!\n');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('📱 Phone:', adminData.phone);
    console.log(
      '\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login!\n',
    );
    console.log('Usuario creado:', result.user);
  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('ya está registrado')) {
      console.log('\n💡 El admin ya existe. Puedes usar:');
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
    }

    process.exit(1);
  }
}

// Ejecutar
createFirstAdmin();
