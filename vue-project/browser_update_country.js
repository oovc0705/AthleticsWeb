// 在浏览器控制台中执行此脚本以更新用户的国家信息
// 复制以下所有代码，在浏览器控制台中粘贴并按回车执行

(function() {
  console.log('%c开始更新用户国家信息...', 'color: blue; font-weight: bold;');
  
  // 获取当前用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  if (!userInfo) {
    console.log('%c✗ 未找到本地用户信息，请先登录', 'color: red;');
    return;
  }
  
  console.log('%c当前用户信息:', 'color: green;');
  console.log('  - ID:', userInfo.id);
  console.log('  - 用户名:', userInfo.username);
  console.log('  - 邮箱:', userInfo.email);
  console.log('  - 国家:', userInfo.country || '未设置');
  
  // 检查是否已经有 country 字段
  if (userInfo.country && userInfo.country === 'CN') {
    console.log('%c✓ 国家信息已经是 CN (中国)，无需更新', 'color: green;');
    return;
  }
  
  // 更新为 CN（中国）
  userInfo.country = 'CN';
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  
  console.log('%c✓ 已更新用户国家信息为: CN (中国)', 'color: green;');
  console.log('%c请刷新页面以查看更改', 'color: blue;');
})();
