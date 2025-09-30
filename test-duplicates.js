#!/usr/bin/env node

// Script para probar la eliminación de duplicados
const API_URL = 'http://localhost:3000';

async function testDebugSites() {
  try {
    console.log('🔍 Probando API de depuración de sitios...');
    const response = await fetch(`${API_URL}/api/debug-sites`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API de depuración funcionando correctamente');
      console.log(`📊 Total de sitios: ${data.totalSites}`);
      console.log(`🔄 Duplicados encontrados: ${data.duplicates.length}`);
      
      if (data.duplicates.length > 0) {
        console.log('\n📋 Lista de duplicados:');
        data.duplicates.forEach(dup => {
          console.log(`   - "${dup.name}" (${dup.count} repeticiones)`);
        });
      }
      
      return data;
    } else {
      console.error('❌ Error en API de depuración:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return null;
  }
}

async function testRemoveDuplicates() {
  try {
    console.log('\n🗑️ Probando eliminación de duplicados...');
    
    // Pedir contraseña
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const password = await new Promise(resolve => {
      rl.question('🔑 Introduce la contraseña para eliminar duplicados: ', resolve);
    });
    
    rl.close();
    
    if (!password) {
      console.log('❌ Contraseña no proporcionada');
      return null;
    }
    
    const response = await fetch(`${API_URL}/api/remove-duplicates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Duplicados eliminados correctamente');
      console.log(`📊 Sitios eliminados: ${data.deletedCount}`);
      console.log(`🔄 Grupos duplicados procesados: ${data.duplicateGroupsFound}`);
      
      if (data.deletedSites && data.deletedSites.length > 0) {
        console.log('\n📋 Sitios eliminados:');
        data.deletedSites.forEach(site => {
          console.log(`   - "${site.name}" (${site.city}) - ID: ${site.id.substring(0, 8)}...`);
        });
      }
      
      return data;
    } else {
      const error = await response.json();
      console.error('❌ Error al eliminar duplicados:', error.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de gestión de duplicados...\n');
  
  // Probar depuración primero
  const debugData = await testDebugSites();
  
  if (debugData && debugData.duplicates.length > 0) {
    console.log('\n⚠️ Se encontraron duplicados. Puedes eliminarlos con el botón en la interfaz web.');
  } else if (debugData) {
    console.log('\n✅ No se encontraron duplicados. La base de datos está limpia.');
  }
  
  console.log('\n📝 Instrucciones para usar en producción:');
  console.log('1. Abre la aplicación en el navegador');
  console.log('2. Haz clic en el botón 📋 (amarillo) para ver duplicados');
  console.log('3. Si hay duplicados, haz clic en el botón 🗑️ (rojo) para eliminarlos');
  console.log('4. Introduce la contraseña cuando se solicite');
  console.log('5. Los duplicados serán eliminados automáticamente');
  
  console.log('\n🎯 Solución para el problema de eliminación:');
  console.log('- Los nombres duplicados NO afectan la eliminación por ID');
  console.log('- Cada sitio tiene un ID único que se usa para eliminar');
  console.log('- Si la eliminación falla, revisa la consola del navegador');
  console.log('- Usa el botón de depuración para ver el estado de los sitios');
}

main().catch(console.error);