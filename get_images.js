// 获取参与者图片信息
async function getParticipantImages() {
    try {
        // 获取 person 目录下的所有图片文件
        const response = await fetch('person/');
        const text = await response.text();
        
        // 使用正则表达式提取文件名
        const fileNameRegex = /href="([^"]+\.(jpg|jpeg|png|gif))"/gi;
        const participants = [];
        let match;

        while ((match = fileNameRegex.exec(text)) !== null) {
            const fileName = match[1];
            // 从文件名中提取姓名（移除扩展名）
            const name = fileName.replace(/\.(jpg|jpeg|png|gif)$/i, '');
            
            participants.push({
                name: decodeURIComponent(name),
                image: `person/${fileName}`
            });
        }

        return {
            success: participants.length > 0,
            participants: participants,
            count: participants.length
        };
    } catch (error) {
        console.error('获取参与者图片失败:', error);
        return {
            success: false,
            participants: [],
            count: 0,
            error: error.message
        };
    }
}

// 导出函数，以便在其他脚本中使用
window.getParticipantImages = getParticipantImages; 