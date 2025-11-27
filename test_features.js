const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAllFeatures() {
    console.log('🧪 COMPREHENSIVE FEATURE TESTING\n');
    console.log('='.repeat(60));

    const results = {
        adminLogin: null,
        userRegistration: null,
        userLogin: null,
        productsAPI: null,
        categoriesAPI: null,
        errors: []
    };

    try {
        // TEST 1: Admin Login
        console.log('\n📝 TEST 1: Admin Login');
        console.log('-'.repeat(60));
        try {
            const adminLoginResponse = await axios.post(`${BASE_URL}/api/admin/login`, {
                email: 'admin@ecommerce.com',
                password: 'admin123'
            });

            results.adminLogin = {
                status: 'SUCCESS',
                data: adminLoginResponse.data
            };

            console.log('✅ Admin Login: SUCCESS');
            console.log('   Token received:', adminLoginResponse.data.token ? 'Yes' : 'No');
            console.log('   Admin ID:', adminLoginResponse.data.admin?.id);
            console.log('   Admin Email:', adminLoginResponse.data.admin?.email);

        } catch (error) {
            results.adminLogin = {
                status: 'FAILED',
                error: error.response?.data || error.message
            };
            results.errors.push({
                test: 'Admin Login',
                error: error.response?.data || error.message
            });
            console.log('❌ Admin Login: FAILED');
            console.log('   Error:', error.response?.data || error.message);
        }

        // TEST 2: User Registration
        console.log('\n📝 TEST 2: User Registration');
        console.log('-'.repeat(60));
        const testEmail = `testuser_${Date.now()}@example.com`;
        try {
            const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
                email: testEmail,
                password: 'test123456',
                firstName: 'Test',
                lastName: 'User',
                phone: '9876543210'
            });

            results.userRegistration = {
                status: 'SUCCESS',
                data: registerResponse.data,
                testEmail: testEmail
            };

            console.log('✅ User Registration: SUCCESS');
            console.log('   User created:', registerResponse.data.user?.email);
            console.log('   User ID:', registerResponse.data.user?.id);
            console.log('   Token received:', registerResponse.data.token ? 'Yes' : 'No');

        } catch (error) {
            results.userRegistration = {
                status: 'FAILED',
                error: error.response?.data || error.message
            };
            results.errors.push({
                test: 'User Registration',
                error: error.response?.data || error.message
            });
            console.log('❌ User Registration: FAILED');
            console.log('   Error:', error.response?.data || error.message);
        }

        // TEST 3: User Login (with newly created user)
        console.log('\n📝 TEST 3: User Login (New User)');
        console.log('-'.repeat(60));
        if (results.userRegistration?.status === 'SUCCESS') {
            try {
                const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
                    email: testEmail,
                    password: 'test123456'
                });

                results.userLogin = {
                    status: 'SUCCESS',
                    data: loginResponse.data
                };

                console.log('✅ User Login: SUCCESS');
                console.log('   User logged in:', loginResponse.data.user?.email);
                console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');

            } catch (error) {
                results.userLogin = {
                    status: 'FAILED',
                    error: error.response?.data || error.message
                };
                results.errors.push({
                    test: 'User Login',
                    error: error.response?.data || error.message
                });
                console.log('❌ User Login: FAILED');
                console.log('   Error:', error.response?.data || error.message);
            }
        } else {
            console.log('⏭️  Skipped (registration failed)');
        }

        // TEST 4: Products API
        console.log('\n📝 TEST 4: Products API');
        console.log('-'.repeat(60));
        try {
            const productsResponse = await axios.get(`${BASE_URL}/api/products`);

            results.productsAPI = {
                status: 'SUCCESS',
                totalProducts: productsResponse.data.total,
                sampleProduct: productsResponse.data.products?.[0]
            };

            console.log('✅ Products API: SUCCESS');
            console.log('   Total products:', productsResponse.data.total);
            console.log('   Products loaded from SQLite:', productsResponse.data.products?.length > 0 ? 'Yes' : 'No');
            if (productsResponse.data.products?.[0]) {
                console.log('   Sample product:', productsResponse.data.products[0].name);
            }

        } catch (error) {
            results.productsAPI = {
                status: 'FAILED',
                error: error.response?.data || error.message
            };
            results.errors.push({
                test: 'Products API',
                error: error.response?.data || error.message
            });
            console.log('❌ Products API: FAILED');
            console.log('   Error:', error.response?.data || error.message);
        }

        // TEST 5: Categories API
        console.log('\n📝 TEST 5: Categories API');
        console.log('-'.repeat(60));
        try {
            const categoriesResponse = await axios.get(`${BASE_URL}/api/categories`);

            results.categoriesAPI = {
                status: 'SUCCESS',
                totalCategories: categoriesResponse.data.categories?.length
            };

            console.log('✅ Categories API: SUCCESS');
            console.log('   Total categories:', categoriesResponse.data.categories?.length);

        } catch (error) {
            results.categoriesAPI = {
                status: 'FAILED',
                error: error.response?.data || error.message
            };
            results.errors.push({
                test: 'Categories API',
                error: error.response?.data || error.message
            });
            console.log('❌ Categories API: FAILED');
            console.log('   Error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('\n❌ UNEXPECTED ERROR:', error.message);
    }

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    const tests = [
        { name: 'Admin Login', result: results.adminLogin },
        { name: 'User Registration', result: results.userRegistration },
        { name: 'User Login', result: results.userLogin },
        { name: 'Products API', result: results.productsAPI },
        { name: 'Categories API', result: results.categoriesAPI }
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
        if (test.result?.status === 'SUCCESS') {
            console.log(`✅ ${test.name}: PASSED`);
            passed++;
        } else if (test.result?.status === 'FAILED') {
            console.log(`❌ ${test.name}: FAILED`);
            failed++;
        } else {
            console.log(`⏭️  ${test.name}: SKIPPED`);
        }
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`Total: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60));

    if (results.errors.length > 0) {
        console.log('\n🐛 ERRORS FOUND:');
        results.errors.forEach((err, index) => {
            console.log(`\n${index + 1}. ${err.test}:`);
            console.log('   ', JSON.stringify(err.error, null, 2));
        });
    }

    console.log('\n✅ Testing complete!\n');

    return results;
}

// Run tests
testAllFeatures()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Test suite failed:', error);
        process.exit(1);
    });
