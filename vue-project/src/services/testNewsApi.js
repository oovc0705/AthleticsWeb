import api from './apiService';

// 测试新闻创建API
export const testCreateNews = async () => {
  try {
    console.log('=== 测试新闻创建API ===');
    
    // 创建测试新闻数据
    const testNews = {
      title: '测试新闻标题',
      content: '这是测试新闻内容',
      date: '2025-12-21',
      author: '测试作者',
      category: '赛事报道',
      imageUrl: ''
    };
    
    console.log('1. 测试数据:', testNews);
    console.log('2. 数据类型:', typeof testNews);
    
    // 直接调用api.post测试
    const response = await api.post('/news', testNews);
    
    console.log('3. 响应状态:', response.status);
    console.log('4. 响应数据:', response);
    
    return response;
  } catch (error) {
    console.error('测试新闻创建API失败:', error);
    console.error('错误响应状态:', error.response?.status);
    console.error('错误响应数据:', error.response?.data);
    throw error;
  }
};

// 直接运行测试
if (typeof window !== 'undefined') {
  // 确保DOM加载完成
  document.addEventListener('DOMContentLoaded', () => {
    // 添加一个测试按钮
    const testButton = document.createElement('button');
    testButton.textContent = '测试新闻API';
    testButton.style.position = 'fixed';
    testButton.style.top = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '10000';
    testButton.addEventListener('click', async () => {
      try {
        await testCreateNews();
        alert('测试成功！');
      } catch (error) {
        alert('测试失败: ' + error.message);
      }
    });
    document.body.appendChild(testButton);
  });
}