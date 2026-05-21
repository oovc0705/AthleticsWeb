const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// 用户数据文件路径
const usersFilePath = path.join(__dirname, 'data/users.json');

// 加载用户数据
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// 测试密码比较
const testPasswordCompare = () => {
  const users = loadUsers();
  
  // 查找管理员用户
  const admin = users.find(user => user.role === 'admin');
  
  if (!admin) {
    console.error('管理员用户不存在！');
    return;
  }
  
  console.log('管理员用户信息:');
  console.log('Email:', admin.email);
  console.log('Password哈希:', admin.password);
  console.log('Password哈希类型:', admin.password.startsWith('$2b$') ? '$2b$ (bcrypt)' : '其他类型');
  
  // 测试密码比较
  const passwordToTest = 'password123';
  console.log('\n测试密码:', passwordToTest);
  
  bcrypt.compare(passwordToTest, admin.password, (err, isMatch) => {
    if (err) {
      console.error('密码比较错误:', err);
      return;
    }
    
    console.log('密码匹配结果:', isMatch);
    
    if (isMatch) {
      console.log('✅ 密码匹配成功！');
    } else {
      console.log('❌ 密码匹配失败！');
      
      // 生成新的哈希值并比较，以确保bcrypt正常工作
      console.log('\n--- 测试bcrypt生成新哈希值 ---');
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error('生成盐错误:', err);
          return;
        }
        
        bcrypt.hash(passwordToTest, salt, (err, newHash) => {
          if (err) {
            console.error('生成哈希错误:', err);
            return;
          }
          
          console.log('新生成的哈希值:', newHash);
          
          // 比较新生成的哈希值
          bcrypt.compare(passwordToTest, newHash, (err, isMatch) => {
            if (err) {
              console.error('新哈希值比较错误:', err);
              return;
            }
            
            console.log('新哈希值匹配结果:', isMatch);
            if (isMatch) {
              console.log('✅ bcrypt功能正常工作！');
            } else {
              console.log('❌ bcrypt功能异常！');
            }
          });
        });
      });
    }
  });
};

// 运行测试
testPasswordCompare();