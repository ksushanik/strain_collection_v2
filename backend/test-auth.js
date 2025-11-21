const API_URL = 'http://localhost:3000';

async function testAuth() {
    try {
        console.log('1. Registering user...');
        const email = `test_${Date.now()}@example.com`;
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'password123',
                name: 'Test User',
                role: 'USER'
            })
        });

        if (!registerRes.ok) throw new Error(`Registration failed: ${registerRes.statusText} ${await registerRes.text()}`);
        const user = await registerRes.json();
        console.log('Registration successful:', user);

        console.log('2. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                password: 'password123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText} ${await loginRes.text()}`);
        const loginData = await loginRes.json();
        console.log('Login successful. Token:', loginData.access_token ? 'Received' : 'Missing');

        const token = loginData.access_token;

        console.log('3. Accessing protected profile...');
        const profileRes = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileRes.ok) throw new Error(`Profile access failed: ${profileRes.statusText} ${await profileRes.text()}`);
        const profile = await profileRes.json();
        console.log('Profile access successful:', profile);

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAuth();
