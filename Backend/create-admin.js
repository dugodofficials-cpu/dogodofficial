require('dotenv').config();
const mongoose = require('mongoose');
const { hash } = require('bcrypt');

// Import your models
const UserModel = require('./dist/modules/users/users.model').default;
const RoleModel = require('./dist/modules/roles/roles.model').RoleModel;
const UserRoleModel = require('./dist/modules/roles/roles.model').UserRoleModel;

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating super admin user...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin role exists
    let adminRole = await RoleModel.findOne({ name: 'admin' });
    
    if (!adminRole) {
      // Create admin role
      adminRole = new RoleModel({
        name: 'admin',
        description: 'Super administrator with full access',
        permissions: [
          'login',
          'create:user', 'read:user', 'update:user', 'delete:user',
          'create:product', 'read:product', 'update:product', 'delete:product',
          'create:order', 'read:order', 'update:order', 'delete:order',
          'create:payment', 'read:payment', 'update:payment', 'delete:payment',
          'process:refund',
          'create:shipment', 'read:shipment', 'update:shipment', 'delete:shipment',
          'manage:shipping:locations',
          'create:cart', 'read:cart', 'update:cart', 'delete:cart',
          'create:role', 'read:role', 'update:role', 'delete:role',
          'assign:role',
          'create:coupon', 'read:coupon', 'update:coupon', 'delete:coupon',
          'upload:media', 'download:media',
          'send:email', 'read:email', 'update:email', 'delete:email',
          'create:blackbox:question', 'read:blackbox:question', 'update:blackbox:question', 'delete:blackbox:question',
          'answer:blackbox:question',
          'create:countdown', 'read:countdown', 'update:countdown', 'delete:countdown'
        ],
        isDefault: false
      });
      await adminRole.save();
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role already exists');
    }
    
    const adminEmail = 'admin@dugodofficial.com';
    const adminPassword = 'DuGod@2024!';
    const hashedPassword = await hash(adminPassword, 10);

    // Check if admin user already exists
    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.firstName, existingAdmin.lastName);

      await UserModel.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        isEmailVerified: true,
        status: 'active'
      });
      console.log('✅ Admin password reset');
      
      // Check if user has admin role
      const userRole = await UserRoleModel.findOne({ 
        userId: existingAdmin._id, 
        roleId: adminRole._id 
      });
      
      if (userRole) {
        console.log('✅ User already has admin role');
      } else {
        // Assign admin role to existing user
        await UserRoleModel.create({
          userId: existingAdmin._id,
          roleId: adminRole._id,
          assignedBy: existingAdmin._id
        });
        console.log('✅ Admin role assigned to existing user');
      }
      return;
    }
    
    // Create super admin user
    const superAdmin = new UserModel({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'active',
      isEmailVerified: true
    });
    
    // Save the admin user
    await superAdmin.save();
    console.log('✅ Super admin user created');
    
    // Assign admin role to the user
    await UserRoleModel.create({
      userId: superAdmin._id,
      roleId: adminRole._id,
      assignedBy: superAdmin._id
    });
    
    console.log('✅ Admin role assigned to user');
    console.log('\n🎉 Super admin created successfully!');
    console.log('📧 Email: admin@dugodofficial.com');
    console.log('🔑 Password: DuGod@2024!');
    console.log('👤 Name: Super Admin');
    console.log('🔑 Role: admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createSuperAdmin();
