document.addEventListener('DOMContentLoaded', function() {
    // 语言相关元素和文本
    const langButtons = document.querySelectorAll('.language-switcher button');
    const langElements = document.querySelectorAll('[data-lang-zh], [data-lang-en], [data-lang-de]');
    
    // 表单元素
    const nameInput = document.getElementById('name');
    const photoInput = document.getElementById('photo');
    const uploadBtn = document.getElementById('upload-btn');
    const submitBtn = document.getElementById('submit-btn');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const loadingElement = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');
    
    // 错误信息元素
    const nameError = document.getElementById('name-error');
    const photoError = document.getElementById('photo-error');
    
    // 多语言错误信息
    const errorMessages = {
        'name': {
            'zh': '请输入您的姓名',
            'en': 'Please enter your name',
            'de': 'Bitte geben Sie Ihren Namen ein'
        },
        'photo': {
            'zh': '请选择一张照片',
            'en': 'Please select a photo',
            'de': 'Bitte wählen Sie ein Foto aus'
        },
        'photoType': {
            'zh': '请选择有效的图片文件 (JPG, PNG, GIF)',
            'en': 'Please select a valid image file (JPG, PNG, GIF)',
            'de': 'Bitte wählen Sie eine gültige Bilddatei (JPG, PNG, GIF)'
        },
        'photoSize': {
            'zh': '照片大小不能超过5MB',
            'en': 'Photo size cannot exceed 5MB',
            'de': 'Die Fotogröße darf 5 MB nicht überschreiten'
        },
        'submitting': {
            'zh': '上传中...',
            'en': 'Uploading...',
            'de': 'Hochladen...'
        },
        'success': {
            'zh': '照片上传成功！谢谢您的参与！',
            'en': 'Photo uploaded successfully! Thank you for your participation!',
            'de': 'Foto erfolgreich hochgeladen! Vielen Dank für Ihre Teilnahme!'
        },
        'error': {
            'zh': '上传失败，请重试',
            'en': 'Upload failed, please try again',
            'de': 'Upload fehlgeschlagen, bitte versuchen Sie es erneut'
        },
        'networkError': {
            'zh': '网络错误，请检查您的网络连接',
            'en': 'Network error, please check your internet connection',
            'de': 'Netzwerkfehler, bitte überprüfen Sie Ihre Internetverbindung'
        },
        'placeholder': {
            'zh': '请输入您的姓名',
            'en': 'Please enter your name',
            'de': 'Bitte geben Sie Ihren Namen ein'
        },
        'choosePhoto': {
            'zh': '点击选择照片',
            'en': 'Choose a photo',
            'de': 'Foto auswählen'
        }
    };
    
    // 当前语言
    let currentLang = 'zh';
    
    // 切换语言
    function switchLanguage(lang) {
        currentLang = lang;
        
        // 更新按钮状态
        langButtons.forEach(button => {
            if (button.dataset.lang === lang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // 更新所有带有语言属性的元素
        langElements.forEach(element => {
            if (element.dataset['lang' + lang.charAt(0).toUpperCase() + lang.slice(1)]) {
                element.textContent = element.dataset['lang' + lang.charAt(0).toUpperCase() + lang.slice(1)];
            }
        });
        
        // 更新表单占位符
        nameInput.placeholder = errorMessages.placeholder[currentLang];
        uploadBtn.textContent = errorMessages.choosePhoto[currentLang];
    }
    
    // 添加语言切换事件监听
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchLanguage(this.dataset.lang);
        });
    });
    
    // 点击上传按钮时触发文件选择
    uploadBtn.addEventListener('click', function() {
        photoInput.click();
    });
    
    // 图片预览
    photoInput.addEventListener('change', function(e) {
        photoError.textContent = '';
        
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // 验证文件类型
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                photoError.textContent = errorMessages.photoType[currentLang];
                return;
            }
            
            // 验证文件大小
            if (file.size > 5 * 1024 * 1024) { // 5MB
                photoError.textContent = errorMessages.photoSize[currentLang];
                return;
            }
            
            // 显示预览
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImage.src = event.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // 更新上传按钮文本
            uploadBtn.textContent = file.name;
        }
    });
    
    // 表单提交
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 重置错误信息
        nameError.textContent = '';
        photoError.textContent = '';
        
        // 验证姓名
        if (!nameInput.value.trim()) {
            nameError.textContent = errorMessages.name[currentLang];
            return;
        }
        
        // 验证照片
        if (!photoInput.files || !photoInput.files[0]) {
            photoError.textContent = errorMessages.photo[currentLang];
            return;
        }
        
        // 显示加载状态
        loadingElement.style.display = 'flex';
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('name', nameInput.value.trim());
        formData.append('photo', photoInput.files[0]);
        
        // 发送AJAX请求
        fetch('upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            // 检查响应状态
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loadingElement.style.display = 'none';
            
            if (data.success) {
                // 显示成功消息
                successMessage.querySelector('p').textContent = errorMessages.success[currentLang];
                successMessage.style.display = 'block';
                
                // 重置表单
                nameInput.value = '';
                photoInput.value = '';
                previewContainer.style.display = 'none';
                uploadBtn.textContent = errorMessages.choosePhoto[currentLang];
                
                // 滚动到顶部
                window.scrollTo(0, 0);
            } else {
                // 显示错误信息
                if (data.error) {
                    if (data.field === 'name') {
                        nameError.textContent = data.error;
                    } else if (data.field === 'photo') {
                        photoError.textContent = data.error;
                    } else {
                        alert(data.error || errorMessages.error[currentLang]);
                    }
                } else {
                    alert(errorMessages.error[currentLang]);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingElement.style.display = 'none';
            alert(errorMessages.networkError[currentLang]);
        });
    });
    
    // 初始化语言
    switchLanguage('zh');
});

// 修改图片加载逻辑
async function loadParticipantImages() {
    try {
        // 使用新的 getParticipantImages 函数
        const result = await getParticipantImages();
        
        if (result.success) {
            const participantList = document.getElementById('participant-list');
            participantList.innerHTML = ''; // 清空现有列表

            result.participants.forEach(participant => {
                const participantDiv = document.createElement('div');
                participantDiv.className = 'participant';
                
                const img = document.createElement('img');
                img.src = participant.image;
                img.alt = participant.name;
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = participant.name;
                
                participantDiv.appendChild(img);
                participantDiv.appendChild(nameSpan);
                
                participantList.appendChild(participantDiv);
            });
        } else {
            console.error('未找到参与者图片');
            const participantList = document.getElementById('participant-list');
            participantList.innerHTML = '<p>暂无参与者信息</p>';
        }
    } catch (error) {
        console.error('加载参与者图片失败:', error);
        const participantList = document.getElementById('participant-list');
        participantList.innerHTML = '<p>加载参与者信息失败</p>';
    }
}

// 页面加载时调用
document.addEventListener('DOMContentLoaded', loadParticipantImages); 