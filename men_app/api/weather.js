

// 高德地图Web服务API Key
const AMAP_KEY = '339c7299cd4988e73ab098e50b09b2ff';

// 获取用户当前位置信息
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02', // 使用国测局坐标系（火星坐标系）
      success: (res) => {
        console.log('获取位置成功:', res);
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        reject(err);
      }
    });
  });
}

// 根据经纬度获取城市信息
export function getCityByLocation(latitude, longitude) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://restapi.amap.com/v3/geocode/regeo`,
      method: 'GET',
      data: {
        key: AMAP_KEY,
        location: `${longitude},${latitude}`,
        extensions: 'base',
        output: 'json'
      },
      success: (res) => {
        if (res.data && res.data.status === '1' && res.data.regeocode) {
          const addressComponent = res.data.regeocode.addressComponent;
          resolve({
            province: addressComponent.province,
            city: addressComponent.city || addressComponent.province, // 直辖市可能没有city
            district: addressComponent.district,
            formatted_address: res.data.regeocode.formatted_address
          });
        } else {
          reject(new Error('解析地址信息失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 获取默认天气信息 - 不需要调用API
export function getDefaultWeather() {
  return {
    city: '杭州市',
    weather: '晴朗',
    temperature: '25°C',
    icon: '🌞',
    advice: '适宜户外训练',
    windDirection: '东南',
    windPower: '3',
    humidity: '40',
    backgroundColor: '#87CEEB', // 添加默认背景色（晴天蓝）
    reportTime: new Date().toISOString().split('T')[0] + ' 08:00:00'
  };
}

// 获取天气信息 - 使用高德天气信息查询API
export function getWeatherByCity(cityCode) {
  return new Promise((resolve, reject) => {
    console.log('开始获取天气信息，城市编码:', cityCode || '默认北京');
    
    // 先返回默认天气，避免超时
    const defaultWeather = getDefaultWeather();
    
    uni.request({
      url: `https://restapi.amap.com/v3/weather/weatherInfo`,
      method: 'GET',
      timeout: 5000, // 5秒超时，留出空间给其他请求
      data: {
        key: AMAP_KEY,
        city: cityCode || '330100', // 默认杭州
        extensions: 'base', // 获取实时天气
        output: 'json'
      },
      success: (res) => {
        console.log('天气API响应:', res.data);
        if (res.data && res.data.status === '1' && res.data.lives && res.data.lives.length > 0) {
          const liveWeather = res.data.lives[0];
          
          // 根据天气状况选择合适的图标和背景色
          let weatherIcon = '🌞'; // 默认晴天图标
          let backgroundColor = '#4B5320'; // 默认军绿色
          const weatherDesc = liveWeather.weather;
          
          if (weatherDesc.includes('雨')) {
            weatherIcon = weatherDesc.includes('大雨') ? '🌧' : '🌦';
            backgroundColor = '#556B2F'; // 雨天深军绿
          } else if (weatherDesc.includes('云') || weatherDesc.includes('阴')) {
            weatherIcon = weatherDesc.includes('多云') ? '🌤' : '☁️';
            backgroundColor = '#5F7A61'; // 多云/阴天浅军绿
          } else if (weatherDesc.includes('雪')) {
            weatherIcon = '❄️';
            backgroundColor = '#6B8E23'; // 雪天橄榄绿
          } else if (weatherDesc.includes('雾') || weatherDesc.includes('霾')) {
            weatherIcon = '🌫';
            backgroundColor = '#4F7942'; // 雾霾天森林绿
          } else if (weatherDesc.includes('风')) {
            weatherIcon = '🌬';
            backgroundColor = '#8B0000'; // 大风天深红色
          }
          
          // 根据天气状况给出训练建议
          let trainingAdvice = '适宜户外训练';
          if (weatherDesc.includes('雨') || weatherDesc.includes('雪')) {
            trainingAdvice = '建议室内训练';
          } else if (weatherDesc.includes('雾') || weatherDesc.includes('霾')) {
            trainingAdvice = '空气质量差，建议室内训练';
          } else if (parseInt(liveWeather.temperature) > 30) {
            trainingAdvice = '温度较高，注意防晒降温';
          } else if (parseInt(liveWeather.temperature) < 5) {
            trainingAdvice = '温度较低，注意保暖';
          }
          
          resolve({
            city: liveWeather.city,
            weather: liveWeather.weather,
            temperature: `${liveWeather.temperature}°C`,
            icon: weatherIcon,
            advice: trainingAdvice,
            windDirection: liveWeather.winddirection,
            windPower: liveWeather.windpower,
            humidity: liveWeather.humidity,
            backgroundColor: backgroundColor, // 添加背景色
            reportTime: liveWeather.reporttime
          });
        } else {
          console.error('获取天气信息失败:', res.data);
          // 使用默认天气信息
          resolve(defaultWeather);
        }
      },
      fail: (err) => {
        console.error('天气API请求失败:', err);
        // 使用默认天气信息
        resolve(defaultWeather);
      }
    });
  });
}

// 获取完整的天气信息（包括位置和天气）
export async function getCompleteWeatherInfo() {
  console.log('开始获取完整天气信息');
  
  // 首先获取天气信息 - 这个函数已经内置了错误处理和默认值
  const weatherInfo = await getWeatherByCity();
  console.log('天气信息获取成功:', weatherInfo);
  
  // 默认位置信息
  let locationInfo = {
    latitude: 39.9042,
    longitude: 116.4074,
    province: weatherInfo.city.includes('市') ? weatherInfo.city : weatherInfo.city + '省',
    city: weatherInfo.city,
    district: '',
    formatted_address: weatherInfo.city
  };
  
  // 尝试获取实际位置，但不影响主流程
  try {
    console.log('尝试获取位置信息');
    const location = await getCurrentLocation();
    console.log('位置获取成功:', location);
    
    // 如果成功获取位置，尝试获取城市信息
    try {
      const cityInfo = await getCityByLocation(location.latitude, location.longitude);
      console.log('城市信息获取成功:', cityInfo);
      
      // 更新位置信息
      locationInfo = {
        ...location,
        ...cityInfo
      };
    } catch (cityError) {
      console.warn('获取城市信息失败:', cityError);
      // 至少更新经纬度
      locationInfo.latitude = location.latitude;
      locationInfo.longitude = location.longitude;
    }
  } catch (locError) {
    console.warn('获取位置信息失败:', locError);
  }
  
  // 合并天气和位置信息
  const result = {
    ...weatherInfo,
    location: locationInfo
  };
  
  console.log('完整天气信息:', result);
  return result;
}
