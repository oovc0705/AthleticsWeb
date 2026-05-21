const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 用户数据文件路径
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// 新的管理员密码
const newAdminPassword = 'admin123';

// 读取用户数据
fs.readFile(usersFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取用户数据失败:', err);
    return;
  }

  try {
    const users = JSON.parse(data);
    
    // 找到管理员用户
    const adminUser = users.find(user => user.role === 'admin');
    
    if (!adminUser) {
      console.error('未找到管理员用户');
      return;
    }

    // 加密新密码
    bcrypt.hash(newAdminPassword, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('密码加密失败:', hashErr);
        return;
      }

      // 更新管理员密码
      adminUser.password = hashedPassword;
      adminUser.updatedAt = Date.now();

      // 保存更新后的用户数据
      fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('保存用户数据失败:', writeErr);
          return;
        }

        console.log(`✅ 管理员密码已更新为: ${newAdminPassword}`);
        console.log('新的加密密码:', hashedPassword);
      });
    });
  } catch (parseErr) {
    console.error('解析用户数据失败:', parseErr);
  }
});
