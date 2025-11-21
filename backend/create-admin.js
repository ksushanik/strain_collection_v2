const API_URL = 'http://localhost:3000';

async function createAdminUser() {
    try {
        console.log('Creating admin user...');
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123',
                name: 'Super Admin',
                role: 'ADMIN'
            })
        });

        if (!registerRes.ok) {
            const error = await registerRes.text();
            throw new Error(`Registration failed: ${registerRes.statusText} - ${error}`);
        }

        const user = await registerRes.json();
        console.log('✅ Admin user created successfully:');
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        console.log('   ID:', user.id);
        console.log('\n📝 Login credentials:');
        console.log('   Email: admin@example.com');
        console.log('   Password: admin123');
    } catch (error) {
        console.error('❌ Failed to create admin user:', error.message);
    }
}

createAdminUser();
